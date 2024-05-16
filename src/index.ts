import express, { Application, Request, Response } from "express";
import Database from "./config/database";
import UserRouter from "./router/UserRouter";
import TaskRouter from "./router/TaskRouter";


class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.databaseSync();
        this.plugins();
        this.routes();
    }

    protected plugins(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
      }

    protected databaseSync(): void {
        const db = new Database();
        db.sequelize?.sync();
    }

    protected routes(): void {
        this.app.use("/api/v1/users", UserRouter);
        this.app.use('/api/v1/tasks', TaskRouter);
    }
}

const port: number = 8080;
const app = new App().app;

app.listen(port, () => {
    console.log(`✅ Server started successfully!, App listening at http://localhost:${port}`);
});