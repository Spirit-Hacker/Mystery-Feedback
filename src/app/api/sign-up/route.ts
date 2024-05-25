import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();

    try {
        const { username, email, password } = await request.json();

        const existingUserVerifiedByUsername = await userModel.findOne({
            username: username,
            isVerified: true
        });

        if(existingUserVerifiedByUsername){
            return Response.json(
                {
                    success: false,
                    message: "Username already taken"
                },
                {
                    status: 400
                }
            );
        }

        const existingUserByEmail = await userModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified === true){
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email"
                    },
                    {status: 400}
                );
            }
            else{
                const hashedPassword = await bcrypt.hash(password, 10);
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);

                existingUserByEmail.username = username;
                existingUserByEmail.email = email;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;

                await existingUserByEmail.save();
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new userModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });

            await newUser.save();
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {status: 500}
            );
        }

        return Response.json(
            {
                success: true,
                message: "User registered successfully"
            },
            {status: 200}
        );
    }
    catch (error) {
        console.log("Error while registering user", error);
        return Response.json(
            {
                success: false,
                message: "Error while registering user"
            },
            {status: 500}
        );
    }
}