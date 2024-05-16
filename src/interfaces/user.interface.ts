import { ITask } from "./task.interface";

export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    country: string;
    task: ITask[];
}
