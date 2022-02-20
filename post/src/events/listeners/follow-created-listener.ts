import { Subjects , Listener , FollowCreatedEvent } from "@social-microservices/common";
import { User } from "../../models/user.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class FollowCreatedListener extends Listener<FollowCreatedEvent>
{
    readonly subject = Subjects.UserFollow;
    queueGroupName   = queueGroupName;

    async onMessage(data : FollowCreatedEvent['data'] , msg : Message)
    {
        const currentUser = await User.findOneAndUpdate(
          { _id : data.follower , version : data.currentUserVersion - 1},
          {$push : { followings : data.following }},
          { new : true }
          );

        await currentUser!.save();

        const user = await User.findByIdAndUpdate(
          { _id : data.following , version : data.userVersion - 1 },
          {$push : { followers : data.follower }},
          { new : true }
        );

        await user!.save();
        
        msg.ack();
    };
};