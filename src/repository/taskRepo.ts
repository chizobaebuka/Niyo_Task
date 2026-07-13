import { Task } from "../models/taskModel";
import { TaskStatus } from "../interfaces/task.interface";

export interface TaskUpdatePayload {
    name?: string;
    status?: TaskStatus;
    dueDate?: Date;
    description?: string;
}

interface iTaskRepo {
    findById(task_id: string): Promise<Task | null>;
    findAll(): Promise<Task[]>;
    getTasksByUserId(user_id: string): Promise<Task[]>;
    update(task_id: string, updates: TaskUpdatePayload): Promise<Task>;
    deleteTaskById(task_id: string): Promise<Task>;
}

export class TaskRepo implements iTaskRepo {
    async findById(task_id: string): Promise<Task | null> {
        try {
            return await Task.findOne({ where: { id: task_id } });
        } catch (error) {
            console.error("Error retrieving task:", error);
            throw new Error("Failed to retrieve task by id:");
        }
    };

    async findAll(): Promise<Task[]> {
        try {
            return await Task.findAll();
        } catch (error) {
            console.error("Error retrieving tasks:", error);
            throw new Error("Failed to retrieve tasks");
        }
    }

    async getTasksByUserId(userId: string): Promise<Task[]> {
        try {
            return await Task.findAll({ where: { userId: userId } });
        } catch (error) {
            console.error("Error retrieving packages:", error);
            throw new Error("Failed to retrieve packages");
        }
    };

    async update(taskId: string, updates: TaskUpdatePayload): Promise<Task> {
        try {
          const task = await Task.findOne({ where: { id: taskId } });
          if (!task) {
            throw new Error("Task not found");
          }
          if (updates.name !== undefined) task.name = updates.name;
          if (updates.status !== undefined) task.status = updates.status;
          if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
          if (updates.description !== undefined) task.description = updates.description;

          await task.save();
          return task;
        } catch (err) {
          if (err instanceof Error) {
            console.log(err);
            throw new Error("Failed to update task: " + err.message);
          } else {
            console.log(err);
            throw new Error("Failed to update task: Unknown error occurred");
          }
        }
      }

    async deleteTaskById(taskId: string): Promise<Task> {
        try {
            const task = await Task.findOne({
                where: { id: taskId}
            })
            if (!task) {
                throw new Error("Task not found");
            }
            await task.destroy();
            return task;
        } catch (error) {
            console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
        }
    }
}

export default new TaskRepo;
