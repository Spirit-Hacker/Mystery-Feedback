import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import { Message } from "@/models/User.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();
    const user = await userModel.findOne(username);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }

    const newMessage: Message = {
      content: content,
      createdAt: new Date(),
    } as Message;
    user.messages.push(newMessage);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Cannot send message to the user", error);
    return Response.json(
      {
        success: false,
        message: "Cannot send message to the user",
      },
      { status: 500 }
    );
  }
}
