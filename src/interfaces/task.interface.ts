export interface ITask {
    id: string;
    name: string;
    description?: string;
    dueDate: Date;
    status: TaskStatus;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum TaskStatus {
    Open = 'Open',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}
