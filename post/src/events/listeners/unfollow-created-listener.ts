import { Subjects , Listener , UnFollowCreatedEvent } from "@social-microservices/common";
import { User } from "../../models/user.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class UnFollowCreatedListener extends Listener<UnFollowCreatedEvent>
{
    readonly subject = Subjects.UserUnFollow;
    queueGroupName   = queueGroupName;

    async onMessage(data : UnFollowCreatedEvent['data'] , msg : Message)
    {
        const currentUser = await User.findOneAndUpdate(
          { _id : data.follower , version : data.currentUserVersion - 1},
          {$pull : { followings : data.following }},
          { new : true }
          );

        await currentUser!.save();

        const user = await User.findByIdAndUpdate(
          { _id : data.following , version : data.userVersion - 1 },
          {$pull : { followers : data.follower }},
          { new : true }
        );

        await user!.save();
        
        msg.ack();
    };
};