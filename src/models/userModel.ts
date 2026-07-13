import { Model, Table, Column, DataType, HasMany, ForeignKey, PrimaryKey, DefaultScope, Scopes } from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Task } from "./taskModel";

@DefaultScope(() => ({
  attributes: { exclude: ["password"] },
}))
@Scopes(() => ({
  withPassword: {},
}))
@Table({
  tableName: User.USER_TABLE_NAME,
  timestamps: true,
})
export class User extends Model {
  public static USER_TABLE_NAME = "Users" as string;
  public static USER_ID = "id" as string;
  public static USER_NAME = "name" as string;
  public static USER_EMAIL = "email" as string;
  public static USER_PASSWORD = "password" as string;
  public static USER_DOB = "dateOfBirth" as string;
  public static USER_COUNTRY = "country" as string;

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    defaultValue: () => uuidv4(),
    field: User.USER_ID,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    field: User.USER_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    validate: { isEmail: true },
    field: User.USER_EMAIL,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    field: User.USER_PASSWORD,
  })
  password!: string;

  @Column({
    type: DataType.DATE,
    field: User.USER_DOB,
  })
  dateOfBirth!: Date;

  @Column({
    type: DataType.STRING(255),
    field: User.USER_COUNTRY,
  })
  country!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt!: Date;

  @HasMany(() => Task)
  tasks!: Task[];

  /** Safety net: password must never be serialized, even for instances built via create()/unscoped() lookups. */
  toJSON(): object {
    const values = { ...this.get() } as Record<string, unknown>;
    delete values.password;
    return values;
  }
}
