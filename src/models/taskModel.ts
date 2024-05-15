import { Model, Table, Column, DataType, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { User } from "./userModel";

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

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
    field: Task.TASK_STATUS,
  })
  status!: string;

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
