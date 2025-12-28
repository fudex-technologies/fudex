import { z } from "zod";

export const completeRegistrationSchema = z.object({
    token: z.string(),
    password: z
        .string()
        .min(8, "password must be at least 8 characters long.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ,
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, !, %, , ?, &)."
        ),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
})