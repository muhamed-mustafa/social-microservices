# Social Microservices

An event-driven social network and marketplace backend built as eight TypeScript microservices on Kubernetes, communicating through NATS Streaming.

The system covers accounts and moderation, posts, comments, replies, a product marketplace, orders, Stripe payments and delayed expiration jobs. Each service owns its own MongoDB database and keeps local replicas of the data it needs from other services by consuming events. The project demonstrates database-per-service design, asynchronous data replication, optimistic concurrency control on replicated documents, delayed jobs with Bull and Redis, and a one-command local Kubernetes workflow with Skaffold.

The event-driven architecture (base publisher/listener classes, the order, payment and expiration flow, the shared `common` package and the Skaffold setup) follows the pattern taught in Stephen Grider's "Microservices with Node JS and React" course; the social domain, its services and the moderation features are my own.

## Services

| Service | Responsibility | Datastore | Main dependencies |
| --- | --- | --- | --- |
| `auth` | Sign-up with e-mail activation, sign-in, password reset, profile and picture upload, follow/unfollow, admin user management and timed bans | MongoDB (`auth-mongo-srv`) | express, mongoose, jsonwebtoken, cookie-session, nodemailer, google-auth-library, cloudinary, moment |
| `post` | Posts with images, likes, search, timeline of own and followed users' posts; replica of users | MongoDB (`post-mongo-srv`) | express, mongoose, cloudinary, lodash |
| `comment` | Comments with media on posts and products; replicas of posts and products | MongoDB (`comment-mongo-srv`) | express, mongoose, cloudinary, lodash |
| `reply` | Replies with media on comments; replica of comments | MongoDB (`reply-mongo-srv`) | express, mongoose, cloudinary, lodash |
| `market` | Product listings with images, likes and search; marks a product as reserved while an order is open | MongoDB (`market-mongo-srv`) | express, mongoose, cloudinary, lodash |
| `order` | Orders for products with an expiration window; replica of products | MongoDB (`order-mongo-srv`) | express, mongoose |
| `payment` | Charges an order through Stripe; replica of orders | MongoDB (`payment-mongo-srv`) | express, mongoose, stripe |
| `expiration` | Delayed jobs for order expiration and ban expiry; no HTTP API | Redis (`expiration-redis-srv`) | bull, node-nats-streaming |
| `common` | Shared library (`@social-microservices/common`): errors, middlewares, event contracts | n/a | express-validator, jsonwebtoken, multer, node-nats-streaming |

## Architecture

### Event bus

Services never call each other over HTTP. All inter-service communication goes through NATS Streaming (`nats-streaming:0.17.0`, cluster id `social`). The `common` package provides abstract `Publisher` and `Listener` classes typed by an event interface, so a subject and its payload shape are checked at compile time. Listeners use queue groups (one per service), durable subscriptions, replay of all available events and manual acknowledgement with a 5 second ack wait, so an event that fails processing is redelivered.

| Subject | Published by | Consumed by |
| --- | --- | --- |
| `user:created` | auth | post |
| `user:updated` | auth | post |
| `user:deleted` | auth | post |
| `user:follow` | auth | post |
| `user:unfollow` | auth | post |
| `admin:created:ban` | auth | expiration |
| `expiration:ban` | expiration | auth |
| `post:created` | post | comment |
| `post:updated` | post | comment |
| `post:deleted` | post | comment |
| `product:created` | market | order, comment |
| `product:updated` | market | order, comment |
| `comment:created` | comment | post, market, reply |
| `comment:updated` | comment | reply |
| `comment:deleted` | comment | post, market, reply |
| `order:created` | order | market, payment, expiration |
| `order:cancelled` | order | market, payment |
| `expiration:complete` | expiration | order |
| `payment:created` | payment | order |

`product:deleted`, `reply:created` and `reply:Deleted` are defined in the shared contracts and have listeners in the comment service, but no service publishes them yet.

### Concurrency and versioning

Replicated documents carry a `version` field (`mongoose-update-if-current` with `versionKey` set to `version`). Events include the version of the source document, and listeners that apply updates look up the local replica at `version - 1` before saving. An event that arrives out of order does not match, is not acknowledged, and is redelivered by NATS after the ack wait.

### Delayed jobs

The expiration service holds two Bull queues backed by Redis. `order:created` schedules a job at the order's `expiresAt`, which publishes `expiration:complete`. `admin:created:ban` schedules a job at the ban's end date, which publishes `expiration:ban` so the auth service lifts the ban.

### Shared library

`common/` is published to npm as `@social-microservices/common` and installed by every service. It contains custom error classes with a common serialization format, the `currentUser`, `requireAuth`, `errorHandler`, upload (multer, in-memory) and sign-up validation middlewares, shared enums, the `Subjects` enum and one typed interface per event.

### Authentication

The auth service signs a JWT (`id`, `email`) and stores it in a cookie session. Every other service verifies the same cookie with the shared `JWT_KEY`, so no service calls auth at request time. Cookies are marked `secure`, so requests must be made over HTTPS.

### Ingress routing

An ingress-nginx resource for host `social-microservices.dev` routes by path prefix:

| Path | Service |
| --- | --- |
| `/api/auth/?(.*)` | `auth-srv:3000` |
| `/api/post/?(.*)` | `post-srv:3000` |
| `/api/product/?(.*)` | `market-srv:3000` |
| `/api/order/?(.*)` | `order-srv:3000` |
| `/api/payment/?(.*)` | `payment-srv:3000` |
| `/api/comment/?(.*)` | `comment-srv:3000` |
| `/api/reply/?(.*)` | `reply-srv:3000` |

## Tech Stack

- Language and runtime: TypeScript, Node.js (run with `ts-node-dev`)
- HTTP: Express, express-async-errors, cookie-session, multer
- Data: MongoDB with Mongoose (one database per service), Redis
- Messaging and jobs: NATS Streaming (`node-nats-streaming`), Bull
- Integrations: Stripe, Cloudinary, Nodemailer with Gmail OAuth2
- Infrastructure: Docker, Kubernetes, ingress-nginx, Skaffold

## Getting Started

### Prerequisites

- Docker
- A local Kubernetes cluster (Docker Desktop or Minikube)
- [Skaffold](https://skaffold.dev/)
- [ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/) installed in the cluster
- Stripe, Cloudinary and Google OAuth (Gmail) credentials

### 1. Map the development host

Add the cluster IP to your hosts file (`127.0.0.1` on Docker Desktop, `minikube ip` on Minikube):

```
127.0.0.1 social-microservices.dev
```

### 2. Create the secrets

```bash
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<value>
kubectl create secret generic cloudinary-secret --from-literal=CLOUDINARY_SECRET_KEY=<value>
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<value>
kubectl create secret generic mail-api-secret-pass-social --from-literal=MAIL_PASS=<value>
kubectl create secret generic client-api-secret-social --from-literal=CLIENT_SECRET=<value>
```

### 3. Set your own account values

The non-secret account settings (`CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `MAIL_USER`, `CLIENT_ID`, `REFRESH_TOKEN`, `REDIRECT_URI`) are plain `env` values in the deployment manifests under `infra/k8s/`. Replace them with your own before deploying.

### 4. Run

```bash
skaffold dev
```

Skaffold builds one image per service, applies the manifests in `infra/k8s/` and syncs changed `src/**/*.ts` files into the running containers. The API is then available at `https://social-microservices.dev/api/...`.

## Environment Variables / Secrets

| Name | Used by | Source | Meaning |
| --- | --- | --- | --- |
| `JWT_KEY` | auth, post, comment, reply, market, payment | secret `jwt-secret` | Signing key for the session JWT |
| `CLOUDINARY_SECRET_KEY` | auth, post, comment, reply, market | secret `cloudinary-secret` | Cloudinary API secret |
| `STRIPE_KEY` | payment | secret `stripe-secret` | Stripe secret key |
| `MAIL_PASS` | auth | secret `mail-api-secret-pass-social` | Password of the sending mailbox |
| `CLIENT_SECRET` | auth | secret `client-api-secret-social` | Google OAuth client secret |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY` | auth, post, comment, reply, market | manifest | Cloudinary account |
| `MAIL_USER`, `MAIL_SERVER_PORT` | auth | manifest | Sending mailbox and SMTP port |
| `CLIENT_ID`, `REFRESH_TOKEN`, `REDIRECT_URI` | auth | manifest | Google OAuth2 settings for Gmail |
| `MONGO_URI` | all HTTP services | manifest | Connection string of the service's own MongoDB |
| `NATS_URL`, `NATS_CLUSTER_ID`, `NATS_CLIENT_ID` | all services | manifest (client id is the pod name) | NATS Streaming connection |
| `REDIS_HOST` | expiration | manifest | Redis host for Bull |
| `EXPIRATION_WINDOW_MILLIE_SECOND` | order | manifest | Time before an unpaid order expires |

## API Overview

Resources are addressed with query parameters rather than path parameters. "Session" means a valid session cookie is required; "Admin" additionally requires the `admin` role.

### Auth (`/api/auth`)

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Register (multipart, optional `profilePicture`, `coverPicture`); e-mails an activation key | Public |
| POST | `/api/auth/signin` | Sign in; rejected while a ban is active | Public |
| POST | `/api/auth/signout` | Clear the session | Public |
| GET | `/api/auth/current-user` | Return the current session user | Optional |
| PATCH | `/api/auth/active` | Activate the account with `activeKey` | Session |
| PATCH | `/api/auth/resend?email=&service=` | Re-send the activation key or reset code | Public |
| PATCH | `/api/auth/forget` | E-mail a password reset code | Public |
| POST | `/api/auth/key?email=` | Validate a reset code | Public |
| PATCH | `/api/auth/reset?email=` | Set a new password | Public |
| PATCH | `/api/auth/user` | Update profile, e-mail, password or pictures | Session |
| DELETE | `/api/auth/user` | Delete own account | Session |
| PATCH | `/api/auth/user/follow?id=` | Follow a user | Session |
| PATCH | `/api/auth/user/unfollow?id=` | Unfollow a user | Session |
| GET | `/api/auth/admin` | List non-admin users | Admin |
| DELETE | `/api/auth/admin?id=` | Delete a user | Admin |
| PATCH | `/api/auth/admin/ban?id=` | Ban a user with `reason` and optional `period` (for example `7d`, `2m`, `1y`) | Admin |
| DELETE | `/api/auth/admin/ban?id=&banId=` | Remove a ban | Admin |

### Post (`/api/post`) and Market (`/api/product`)

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/post` | Create a post (multipart `images`) | Session |
| PATCH | `/api/post?id=` | Update a post; `imageId` removes an image | Session |
| DELETE | `/api/post?id=` | Delete own post | Session |
| GET | `/api/post?postId=` | Get a post | Session |
| GET | `/api/posts` | List own posts | Session |
| GET | `/api/post/timeline/all` | Own posts plus posts of followed users | Session |
| PATCH | `/api/post/like?id=` | Toggle like | Session |
| GET | `/api/post/search?search=`, `/api/post/search-all?search=` | Search posts by content | Session |
| POST | `/api/product/create` | Create a product (multipart `images`, `price` required) | Session |
| PATCH | `/api/product/update?id=` | Update a product; `imageId` removes an image | Session |
| DELETE | `/api/product/delete?id=` | Delete own product | Session |
| GET | `/api/product?productId=` | Get a product | Session |
| GET | `/api/products` | List own products | Session |
| GET | `/api/product/timeline/all` | List all products | Session |
| PATCH | `/api/product/like?id=` | Toggle like | Session |
| GET | `/api/product/search?search=&price=`, `/api/product/search-all?search=&price=` | Search products | Session |

### Comment, Reply, Order, Payment

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/comment?postId=&productId=` | Comment on a post or product (multipart `media`) | Session |
| GET | `/api/comment?id=` | Get a comment with its post or product | Session |
| PATCH | `/api/comment?id=` | Update a comment; `mediaId` removes a media item | Session |
| POST | `/api/reply?commentId=` | Reply to a comment (multipart `media`) | Session |
| GET | `/api/reply?id=` | Get a reply | Session |
| PATCH | `/api/reply?replyId=` | Update a reply; `mediaId` removes a media item | Session |
| DELETE | `/api/reply?id=` | Delete a reply | Session |
| POST | `/api/order` | Create an order for `productId` | Session |
| GET | `/api/order` | List own orders | Session |
| PATCH | `/api/order?orderId=` | Cancel own order | Session |
| POST | `/api/payment` | Charge an order with a Stripe `token` | Session |

Handlers for listing and deleting comments, listing replies and fetching a single order exist in the code but are currently registered on a path already taken by another handler; see the status section.

## Project Status / Roadmap

The project was built in February 2022 as a learning-driven portfolio piece and is not production-ready. The event flows between services are implemented end to end; the items below are known gaps.

- No automated tests yet. Planned: Jest and Supertest with an in-memory MongoDB and a mocked NATS client per service.
- Route collisions: list and delete handlers in `comment`, two list handlers in `reply` and the single-order handler in `order` share a method and path with an earlier handler and are unreachable; the comment delete handler is also registered as `GET`. These need distinct paths.
- Creating a comment currently requires both `postId` and `productId` instead of either.
- The `order` deployment manifest does not inject `JWT_KEY`, so the service cannot verify sessions as deployed, and new orders are created with status `complete` rather than `created`, which bypasses the expiration flow.
- `PATCH /api/auth/reset` does not re-check the reset code; it should require the code validated by `/api/auth/key`.
- Publish `reply:created`, `reply:Deleted` and `product:deleted`, and review version-check lookups in listeners (several query on `id` rather than `_id`).
- Move mail and OAuth settings from plain manifest values into Kubernetes secrets; add request validation, pagination and database-side search.
- NATS Streaming is deprecated upstream; a migration to NATS JetStream is the natural next step.

---

Built by [Muhammed Mustafa](https://github.com/muhamed-mustafa).
