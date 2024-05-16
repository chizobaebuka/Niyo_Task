import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../models/userModel';
import { UserRepo } from '../repository/userRepo';
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

    async findAllUsers (req: Request, res: Response) {
        try {
            const users = await new UserRepo().findAll();
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Users retrieved successfully',
                data: users,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error retrieving users:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }

    async findUserById (req: Request, res: Response) {
        try {
            let id = req.params["id"];
            // const { id } = req.params;
            const user = await new UserRepo().findById(id);
            if (!user) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'User not found' });
                return;
            }
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'User retrieved successfully',
                data: user,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error retrieving user:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }

    async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const { name, email, password, dateOfBirth, country } = req.body;
    
        try {
            const user = await User.findOne({ where: { id: id } });
    
            if (!user) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'User not found',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
                return;
            }
    
            // Update the user's properties
            if (name) user.name = name;
            if (email) user.email = email;
            if (password) user.password = await bcrypt.hash(password, 10); // Hash the password before saving
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;
            if (country) user.country = country;
    
            // Save the user
            await user.save();
            const updatedUser = await User.findOne({ where: { id: id } });
    
            // Ensures updatedUser is not null
            if (!updatedUser) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'User not found after update',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
                return;
            }

            await new UserRepo().update(updatedUser);
    
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'User updated successfully',
                data: updatedUser.get(),
                status: HTTP_STATUS_CODE.SUCCESS
            });
        } catch (error: any) {
            console.error('Error updating user:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    
    async logoutUser(req: Request, res: Response) {
        try {
            res.clearCookie('accessToken');
            res.setHeader('Authorization', '');
    
            res.status(HTTP_STATUS_CODE.SUCCESS).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error logging out user:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }
    
    async deleteUser (req: Request, res: Response) {
        try {
            let id = req.params["id"];
            const user = await new UserRepo().delete(id);
            if (!user) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'User not found' });
                return;
            }
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'User deleted successfully',
                data: user,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }
}

export default new UserController;