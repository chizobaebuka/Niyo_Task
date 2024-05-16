import { IUser } from "./user.interface";

export interface ITask {
    id: number;
    name: string;
    pickupDate: Date;
    status: TaskStatus;
    userId: IUser;
}

export enum TaskStatus {
    Open = 'Open',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}
