import { Response } from 'express';
import * as dotenv from 'dotenv';
import { Task } from '../models/taskModel';
import { RequestExt } from '../middleware/authenticateUser';
import { HTTP_STATUS_CODE } from '../constants';
import { v4 as uuidv4 } from "uuid";
import { createTaskSchema, updateTaskSchema } from '../schema/TaskSchema';
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
            // Ensure that the properties of newTask match the Task model
            const newTask = {
                id: taskId,
                name: _data.name,
                status: _data.status,
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
            const requesterId = req.body._userId;
            if (!taskId) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: 'Task ID is missing in request' });
            }

            const task = await new TaskRepo().findById(taskId);
            if (!task) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Task not found' });
            }
            if (task.userId !== requesterId) {
                return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ message: 'You do not have permission to view this task' });
            }

            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Task retrieved successfully',
                data: task,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error retrieving task:', error);
            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    }

    /** Returns the requesting user's own tasks. There is no admin role in this system, so a system-wide listing would leak every user's tasks to anyone with a valid token. */
    async getAllTasks(req: RequestExt, res: Response) {
        try {
            const requesterId = req.body._userId;
            const tasks = await new TaskRepo().getTasksByUserId(requesterId);
            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Tasks retrieved successfully',
                data: tasks,
                status: HTTP_STATUS_CODE.SUCCESS,
            });
        } catch (error) {
            console.error('Error getting tasks:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
        }
    };

    async getAllTasksByUserId(req: RequestExt, res: Response) {
        try {
            const userId = req.params.userId;
            const requesterId = req.body._userId;
            if (!userId) {
              return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: 'User ID is missing in request' });
            }
            if (userId !== requesterId) {
              return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ message: 'You do not have permission to view this user\'s tasks' });
            }

            const tasks = await new TaskRepo().getTasksByUserId(userId);

            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
              message: `Tasks retrieved successfully for the user with id: ${userId}`,
              data: tasks,
              status: HTTP_STATUS_CODE.SUCCESS,
            });
          } catch (error) {
            console.error('Error retrieving tasks:', error);
            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ message: 'Internal server error' });
          }
    }

    async updateTaskById(req: RequestExt, res: Response) {
        const taskId = req.params.id;
        const { _user, _userId: requesterId, ...rest } = req.body;

        const requestData = updateTaskSchema.safeParse(rest);
        if (!requestData.success) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                message: requestData.error.issues
            });
        }

        try {
            const task = await Task.findOne({ where: { id: taskId } });

            if (!task) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'Task not found',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
            }
            if (task.userId !== requesterId) {
                return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    message: 'You do not have permission to modify this task',
                    status: HTTP_STATUS_CODE.FORBIDDEN
                });
            }

            const updatedTask = await new TaskRepo().update(taskId, requestData.data);

            res.status(HTTP_STATUS_CODE.SUCCESS).json({
                message: 'Task updated successfully',
                data: updatedTask,
                status: HTTP_STATUS_CODE.SUCCESS
            });
        } catch (error: any) {
            console.error('Error updating task:', error);
            res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async deleteTaskById(req: RequestExt, res: Response) {
        const taskId = req.params.id;
        const requesterId = req.body._userId;

        try {
            const task = await Task.findOne({ where: { id: taskId } });
            if (!task) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    message: 'Task not found',
                    status: HTTP_STATUS_CODE.NOT_FOUND
                });
            }
            if (task.userId !== requesterId) {
                return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    message: 'You do not have permission to delete this task',
                    status: HTTP_STATUS_CODE.FORBIDDEN
                });
            }

            const taskDeleted = await new TaskRepo().deleteTaskById(task.id)

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