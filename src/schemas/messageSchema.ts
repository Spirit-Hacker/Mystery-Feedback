import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Message must be atleast 10 characters" })
    .max(300, "Message must be not more than 300 characters"),
});
