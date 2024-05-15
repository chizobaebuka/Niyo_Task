import userController from "../controller/userController";
import { createUserSchema, loginUserSchema } from "../schema/UserSchema";
import validate from "../utils/validate";
import BaseRoutes from "./base/BaseRouter";


class UserRoutes extends BaseRoutes {

    public routes(): void {
        this.router.post("/", validate(createUserSchema), userController.createUser),
        this.router.post('/login', validate(loginUserSchema), userController.loginUser),
        this.router.post('/logout', userController.logoutUser),
        this.router.get('/', userController.findAllUsers),
        this.router.get('/:id', userController.findUserById),
        this.router.patch('/:id', userController.updateUser),
        this.router.delete('/:id', userController.deleteUser)
    }
}

export default new UserRoutes().router;