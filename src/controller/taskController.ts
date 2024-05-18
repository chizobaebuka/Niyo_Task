import { Response } from 'express';
import * as dotenv from 'dotenv';
import { Task } from '../models/taskModel';
import { RequestExt } from '../middleware/authenticateUser';
import { HTTP_STATUS_CODE } from '../constants';
import { v4 as uuidv4 } from "uuid";
import { createTaskSchema } from '../schema/TaskSchema';
import { TaskStatus } from '../interfaces/task.interface';  
import { TaskRepo } from '../repository/taskRepo';
import appInstance from '../index';

dotenv.config();

class TaskController {
    async createTask(req: RequestExt, res: Response) {
        const { _user: user, _userId: userId, ...rest } = req.body;
    
        const requestData = createTaskSchema.strict().safeParse(rest);
        if (!requestData.success) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                message: requestData.error.issues
            });
        }
    
        const _data = requestData.data;
        const taskId = uuidv4();
    
        try {
            const statusValue = _data.status as TaskStatus;
            if (!(statusValue in TaskStatus)) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    message: 'Invalid status value. Status should be one of: SentOut, InTransit, Pending, Received'
                });
            }
    
            // Ensure that the properties of newTask match the Task model
            const newTask = {
                id: taskId,
                name: _data.name,
                status: statusValue,
                description: _data.description,
                dueDate: _data.dueDate, // Ensure that dueDate property is correctly set
                userId: userId,
            }
    
            const createdTask = await Task.create(newTask);
            appInstance.io.emit('taskcreated', createdTask)

            return res.status(HTTP_STATUS_CODE.CREATED).json({
                message: 'Task created successfully',
                data: createdTask,
                status: HTTP_STATUS_CODE.CREATED,
            });
        } catch (error) {
            console.error('Error creating task:', error);
            await Task.destroy({ where: { id: taskId } })
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }

    async getTaskById(req: RequestExt, res: Response) {
        try {
            const taskId = req.params.id; 
            if (!taskId) {
                return res.status(400).json({ message: 'Task ID is missing in request' });
            }
    
            const task = await new TaskRepo().findById(taskId);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
    
            return res.status(200).json({
                message: 'Task retrieved successfully',
                data: task,
                status: 200,
            });
        } catch (error) {
            console.error('Error retrieving task:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async getAllTasks(req: RequestExt, res: Response) {
        try {
            const tasks = await new TaskRepo().findAll();
            if(!tasks) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Packages not found' });
            }
            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Tasks retrieved successfully',
                data: tasks,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error getting all package:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    };

    async getAllTasksByUserId(req: RequestExt, res: Response) {
        try {
            const userId = req.params.userId;
            if (!userId) {
              return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: 'User ID is missing in request' });
            }
        
            const packages = await new TaskRepo().getTasksByUserId(userId);
            if (!packages || packages.length === 0) {
              return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'No tasks found for the user' });
            }
        
            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
              message: `Tasks retrieved successfully for the user with id: ${userId}`,
              data: packages,
              status: HTTP_STATUS_CODE.SUCCESS,
            });
          } catch (error) {
            console.error('Error retrieving packages:', error);
            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
          }
    }

    async updateTaskById(req: RequestExt, res: Response) {
        const taskId = req.params.id
        const { name, status, dueDate } = req.body;

        try {
            const task = await Task.findOne({ where: { id: taskId } });
    
            if (!task) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'Task not found',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
                return;
            }
    
            // Update the user's properties
            if (name) task.name = name;
            if (status) task.status = status;
            if (dueDate) task.dueDate = dueDate;
    
            // Save the task
            await task.save();
            const updatedTask = await Task.findOne({ where: { id: taskId } });
    
            // Ensures updatedTask is not null
            if (!updatedTask) {
                res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'User not found after update',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
                return;
            }

            await new TaskRepo().update(updatedTask);
    
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'User updated successfully',
                data: updatedTask.get(),
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

    async deleteTaskById(req: RequestExt, res: Response) {
        const taskId = req.params.id;

        try {
            const task = await Task.findOne({ where: { id: taskId } });
            if (!task) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'Task not found',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
            }

            const taskDeleted = await new TaskRepo().deleteTaskById(task.id)

            // await task.destroy();
            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Task deleted successfully',
                data: taskDeleted,
                status: HTTP_STATUS_CODE.SUCCESS
            });
            return;

        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({
                message: 'Internal server error',
                status: HTTP_STATUS_CODE.INTERNAL_SERVER
            });
            return;
        }
    }
}

export default new TaskController;