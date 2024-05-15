import * as z from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required'
        }).min(3, 'Name must be at least 3 characters long'),
        email: z.string({
            required_error: 'Email is required'
        }).email('Invalid email format'),
        password: z.string({
            required_error: 'Password is required'
        }).min(6, 'Password must be at least 6 characters long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
        dateOfBirth: z.string({
            required_error: 'Birthdate is required'
        }),
        country: z.string({
            required_error: 'Country is required'
        })
    })
});

export const loginUserSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: 'Email is required'
        }).email('Invalid email format'),
        password: z.string({
            required_error: 'Password is required'
        }).min(6, 'Password must be at least 6 characters long')
        //.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    })
});

