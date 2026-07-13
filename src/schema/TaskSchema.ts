import * as z from 'zod';
import { TaskStatus } from '../interfaces/task.interface';

export const createTaskSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    status: z.enum([
        TaskStatus.Open,
        TaskStatus.InProgress,
        TaskStatus.Completed,
        TaskStatus.Cancelled
    ]),
    dueDate: z.coerce.date(),
    description: z.string().optional()
});

export const updateTaskSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    status: z.enum([
        TaskStatus.Open,
        TaskStatus.InProgress,
        TaskStatus.Completed,
        TaskStatus.Cancelled
    ]).optional(),
    dueDate: z.coerce.date().optional(),
    description: z.string().optional()
}).strict();
