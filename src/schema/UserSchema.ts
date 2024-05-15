import * as z from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1), // Simply checks if name is a non-empty string
    email: z.string().email(), // Checks if email is a valid email format
    password: z.string().min(1), // Simply checks if password is a non-empty string
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Checks if dateOfBirth is in the format "yyyy-mm-dd"
    country: z.string().min(1), // Simply checks if country is a non-empty string
});
