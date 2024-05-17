import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "./config/database";
import UserRouter from "./router/UserRouter";
import TaskRouter from "./router/TaskRouter";
import path from "path";

class App {
    public app: Application;
    public server: any;
    public io: Server;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server);
        this.databaseSync();
        this.plugins();
        this.routes();
        this.sockets();
        this.staticFiles();
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
        this.app.get('/', (req: Request, res: Response) => {
            res.sendFile(path.resolve('./client/index.html'));
        })
    }

    protected sockets(): void {
        this.io.on("connection", (socket) => {
            console.log("A user connected", socket.id);

            socket.on("disconnect", () => {
                console.log("A user disconnected");
            });

            socket.on("message", (message) => {
                console.log("Message received: ", message);
                // Echo the message back to the client
                this.io.emit("message", message);
            });
        });
    }

    protected staticFiles(): void {
        this.app.use(express.static(path.join(__dirname, '..', 'client')));
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
        });
    }
    
}

const port: number = 8080;
const appInstance = new App();
const app = appInstance.app;

appInstance.server.listen(port, () => {
    console.log(`✅ Server started successfully!, App listening at http://localhost:${port}`);
});
