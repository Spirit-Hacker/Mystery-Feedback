"use client";

import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/schemas/verifySchema";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponce } from "@/types/apiResponce";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const VerifyAccount = () => {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async(data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code
      });

      toast({
        title: response.data.success ? "Success" : "Failed",
        description: response.data.message
      });

      router.replace("/sign-in");
    }
    catch (error) {
      console.log("Error while otp verification of user", error);
      const axiosError = error as AxiosError<ApiResponce>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 shadow-md bg-white rounded-lg">

        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-6 lg:text-5xl">Verify Account</h1>
          <p className="mb-4">Enter verification code sent to your email</p>
        </div>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6 digit code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  )
};

export default VerifyAccount;
