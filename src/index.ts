import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "./config/database";
import UserRouter from "./router/UserRouter";
import TaskRouter from "./router/TaskRouter";
import path from "path";
import { API_PORT } from "./config/config";

class App {
    public app: Application;
    public server: any;
    public io: Server;
    private db: Database;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server);
        this.db = new Database();
        this.plugins();
        this.routes();
        this.sockets();
        this.staticFiles();
    }

    /** Connects to the database and only then starts accepting HTTP traffic, so requests never race an unready connection pool. */
    public async start(port: number): Promise<void> {
        await this.db.connect();
        await new Promise<void>((resolve) => {
            this.server.listen(port, () => {
                console.log(`✅ Server started successfully!, App listening at http://localhost:${port}`);
                resolve();
            });
        });
    }

    protected plugins(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    protected routes(): void {
        this.app.use("/api/v1/users", UserRouter);
        this.app.use('/api/v1/tasks', TaskRouter);
        this.app.get('/', (req: Request, res: Response) => {
            res.sendFile(path.resolve(__dirname, '../src/client/index.html'));
        });
        
    }

    protected sockets(): void {
        this.io.on("connection", (socket) => {
            console.log("A user connected", socket.id);
    
            socket.on("disconnect", () => {
                console.log("A user disconnected");
            });
    
            socket.on("createTask", (taskData) => {
                console.log("Task created:", taskData);
                // Emit a message to acknowledge the task creation
                socket.emit("taskCreated", { message: "Task created successfully", task: taskData });
            });
        });
    }
    

    protected staticFiles(): void {
        this.app.use(express.static(path.join(__dirname, '..', 'src', 'client')));
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'src', 'client', 'index.html'));
        });
    }    
    
}

const appInstance = new App();
const app = appInstance.app;

appInstance.start(API_PORT).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default appInstance;