import BaseRoutes from './base/BaseRouter';
import { authorizationMiddleware } from '../middleware/authenticateUser'; 
import taskController from '../controller/taskController';

class TaskRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post('/', authorizationMiddleware, taskController.createTask),
        this.router.get('/:id', authorizationMiddleware, taskController.getTaskById),
        this.router.get('/', authorizationMiddleware, taskController.getAllTasks),
        this.router.get('/users-tasks/:userId', authorizationMiddleware, taskController.getAllTasksByUserId),
        this.router.patch('/:id', authorizationMiddleware, taskController.updateTaskById)
        this.router.delete('/:id', authorizationMiddleware, taskController.deleteTaskById)
    }
}

export default new TaskRoutes().router;
