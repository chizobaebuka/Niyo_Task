import { Task } from "../models/taskModel";

interface iTaskRepo {
    findById(task_id: string): Promise<Task | null>;
    findAll(): Promise<Task[]>;
    getTasksByUserId(user_id: string): Promise<Task[]>;
    update(task: Task): Promise<Task>;
    deleteTaskById(task_id: string): Promise<Task>;
}

export class TaskRepo implements iTaskRepo {
    async findById(package_id: string): Promise<Task | null> {
        try {
            const _package = await Task.findOne({ where: { id: package_id } });
            if (!_package) {
                throw new Error("Task not found");
            }

            return _package;
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

    async update(task: Task): Promise<Task> {
        try {
          const newTask = await Task.findOne({ where: { id: task.id } });
          if (!newTask) {
            throw new Error("User not found");
          }
          newTask.name = task.name;
          newTask.status = task.status;
          newTask.dueDate = task.dueDate;
    
          await newTask.save();
          task.save();
          return newTask;
        } catch (err) {
          if (err instanceof Error) {
            console.log(err);
            throw new Error("Failed to update user: " + err.message);
          } else {
            console.log(err);
            throw new Error("Failed to update user: Unknown error occurred");
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
