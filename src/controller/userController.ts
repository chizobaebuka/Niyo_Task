import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UserRepo } from '../repository/userRepo';
import * as dotenv from 'dotenv';
import { HTTP_STATUS_CODE } from '../constants/httpStatusCodes';
import { RequestExt } from '../middleware/authenticateUser';

dotenv.config();

class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const createdUser = await new UserRepo().signUp({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                dateOfBirth: req.body.dateOfBirth,
                country: req.body.country,
            });

            res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', data: { user: createdUser } });
        } catch (error: any) {
            console.error('Error creating user:', error);
            if (error.message === 'Email already in use') {
                return res.status(HTTP_STATUS_CODE.CONFLICT).json({ message: error.message });
            }
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

    async updateUser(req: RequestExt, res: Response) {
        const { id } = req.params;
        const { _user, _userId: requesterId, name, email, password, dateOfBirth, country } = req.body;

        if (id !== requesterId) {
            res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                message: 'You do not have permission to modify this user',
                status: HTTP_STATUS_CODE.FORBIDDEN
            });
            return;
        }

        try {
            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

            const updatedUser = await new UserRepo().update(id, {
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
                country,
            });

            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'User updated successfully',
                data: updatedUser,
                status: HTTP_STATUS_CODE.SUCCESS
            });
        } catch (error: any) {
            console.error('Error updating user:', error);
            if (error.message === 'User not found') {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: error.message, status: HTTP_STATUS_CODE.NOT_FOUND });
                return;
            }
            if (error.message === 'Email already in use') {
                res.status(HTTP_STATUS_CODE.CONFLICT).json({ message: error.message, status: HTTP_STATUS_CODE.CONFLICT });
                return;
            }
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

    async deleteUser (req: RequestExt, res: Response) {
        try {
            const id = req.params["id"];
            const requesterId = req.body._userId;

            if (id !== requesterId) {
                res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ message: 'You do not have permission to delete this user' });
                return;
            }

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
