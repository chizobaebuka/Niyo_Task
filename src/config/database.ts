import { Sequelize } from "sequelize-typescript";
import { db_name, db_host, db_port, db_user, db_password } from "./config";
import { User } from "../models/userModel";
import { Task } from "../models/taskModel";

class Database {
    public sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            database: db_name,
            username: db_user,
            password: db_password,
            host: db_host,
            port: db_port,
            dialect: 'postgres',
            models: [User, Task],
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
        });
    }

    /**
     * Callers must await this before serving traffic; the pool isn't usable until authenticate()+sync() resolve.
     * `alter` is enabled outside production so schema changes (e.g. new unique constraints) reach databases that
     * were already synced under an older model shape; production deployments should use the migrations/ folder instead.
     */
    public async connect(): Promise<void> {
        await this.sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await this.sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
        console.log('Models have been synchronized with the database.');
    }
}

export default Database;