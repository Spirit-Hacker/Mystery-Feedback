import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    // validate with zod
    const result = usernameQuerySchema.safeParse(queryParams);
    // console.log("RESULT : ", result);
    // console.log("REQUEST : ", request);
    // console.log("REQUEST URL : ", new URL(request.url));
    // console.log("searchParams : ", searchParams);
    // console.log("queryParams : ", queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      console.log("result.error.format(): ", result.error.format());

      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid username",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;
    const existingVerifiedUser = await userModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "username already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username unique", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username unique",
      },
      { status: 500 }
    );
  }
}
