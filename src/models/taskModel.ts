import { Model, Table, Column, DataType, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { User } from "./userModel";
import { TaskStatus } from "../interfaces/task.interface";

@Table({
  tableName: "Tasks",
  timestamps: true,
})
export class Task extends Model {
  public static TASK_ID = "id" as string;
  public static TASK_NAME = "name" as string;
  public static TASK_DESCRIPTION = "description" as string;
  public static TASK_STATUS = "status" as string;
  public static TASK_DUE_DATE = "dueDate" as string; // Added TASK_DUE_DATE
  public static TASK_USER_ID = "userId" as string;

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    field: Task.TASK_ID, 
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: Task.TASK_USER_ID,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: Task.TASK_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: Task.TASK_DESCRIPTION,
  })
  description?: string;

  // STRING + validate rather than a native ENUM: converting an existing STRING column to a Postgres
  // ENUM type via sync({ alter: true }) fails on databases that already have rows/defaults, since
  // Postgres can't auto-cast a column default across the type change.
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: TaskStatus.Open,
    validate: { isIn: [Object.values(TaskStatus)] },
    field: Task.TASK_STATUS,
  })
  status!: TaskStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: Task.TASK_DUE_DATE, // Using the static property for the field name
  })
  dueDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'createdAt',
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updatedAt',
  })
  updatedAt!: Date;
}
