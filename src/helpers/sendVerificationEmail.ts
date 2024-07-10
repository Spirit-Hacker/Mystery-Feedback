import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponce } from "@/types/apiResponce";

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponce> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Feedback | Verification Code",
      react: VerificationEmail({ username: username, otp: verifyCode }),
    });

    return {
      success: true,
      message: "Verification email send successfully",
    };
  } catch (error) {
    console.error("Error while sending verification email : ", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
