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

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const userRepo = new UserRepo();
            const loginResult = await userRepo.login(email, password);

            res.cookie('accessToken', loginResult.token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration

            res.setHeader('Authorization', `Bearer ${loginResult.token}`);


            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Login successful',
                user: loginResult.user,
                token: loginResult.token,
            });
        } catch (error: any) {
            res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ message: error.message });
        }
    }
}

export default new UserController;