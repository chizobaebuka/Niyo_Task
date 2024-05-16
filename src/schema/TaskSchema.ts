import * as z from 'zod';
import { TaskStatus } from '../interfaces/task.interface';

export const createTaskSchema = z.object({
    name: z.string(),
    status: z.enum([
        TaskStatus.Open,
        TaskStatus.InProgress,
        TaskStatus.Completed,
        TaskStatus.Cancelled
    ]),
    dueDate: z.date().or(z.string()),
    description: z.string().optional()
});
