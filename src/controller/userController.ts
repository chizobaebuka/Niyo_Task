import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../models/userModel';
import { UserRepo } from '../repository/userRepo';
// import { createUserSchema } from '../schema/userSchema';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { HTTP_STATUS_CODE } from '../constants/httpStatusCodes';

dotenv.config();

class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
            const newUser = new User();
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.password =  hashedPassword;
            newUser.dateOfBirth = req.body.dateOfBirth;
            newUser.country = req.body.country;
    
            await new UserRepo().signUp(newUser);
            
            res.status(HTTP_STATUS_CODE.SUCCESS).json({ message: 'User created successfully', data: { user: newUser } });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }
}

export default new UserController;