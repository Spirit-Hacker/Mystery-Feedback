import userModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    const queryParams = {
      username: decodedUsername,
    };

    // verify username with zod
    const result = usernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid username",
        },
        { status: 401 }
      );
    }

    const user = await userModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = code === user.verifyCode;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please signup again to get a new verification code",
        },
        { status: 401 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message:
            "Verification code invalid, please enter verification code correctly",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.log("Error while verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error while verifying user",
      },
      { status: 500 }
    );
  }
}
