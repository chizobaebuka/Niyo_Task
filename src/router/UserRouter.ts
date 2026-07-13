import userController from "../controller/userController";
import { authorizationMiddleware } from "../middleware/authenticateUser";
import { createUserSchema, loginUserSchema } from "../schema/UserSchema";
import validate from "../utils/validate";
import BaseRoutes from "./base/BaseRouter";


class UserRoutes extends BaseRoutes {

    public routes(): void {
        this.router.post("/", validate(createUserSchema), userController.createUser),
        this.router.post('/login', validate(loginUserSchema), userController.loginUser),
        this.router.post('/logout', userController.logoutUser),
        this.router.get('/', authorizationMiddleware, userController.findAllUsers),
        this.router.get('/:id', authorizationMiddleware, userController.findUserById),
        this.router.patch('/:id', authorizationMiddleware, userController.updateUser),
        this.router.delete('/:id', authorizationMiddleware, userController.deleteUser)
    }
}

export default new UserRoutes().router;