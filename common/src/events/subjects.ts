export enum Subjects 
{ 
    ProductCreated = 'product:created',
    ProductUpdated = 'product:updated',
    OrderCreated   = 'order:created',
    OrderCancelled = 'order:cancelled',
    PaymentCreated = 'payment:created',
    AdminCreatedBan = 'admin:created:ban',
    ExpirationBan   = 'expiration:ban',
    ExpirationComplete = 'expiration:complete',
    UserCreated  = 'user:created',
    UserUpdated  = 'user:updated',
    UserDeleted  = 'user:deleted',
    UserFollow   = 'user:follow',
    UserUnFollow = 'user:unfollow',
    PostCreated  = 'post:created',
    PostUpdated  = 'post:updated',
    PostDeleted  = 'post:deleted',
};
