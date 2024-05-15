import userController from "../controller/userController";
import { createUserSchema, loginUserSchema } from "../schema/UserSchema";
import validate from "../utils/validate";
// import validate from "../helpers/validate";
// import { createUserSchema, loginUserSchema, updateUserSchema } from "../schema/userSchema";
import BaseRoutes from "./base/BaseRouter";


class UserRoutes extends BaseRoutes {

    public routes(): void {
        this.router.post("/", validate(createUserSchema), userController.createUser),
        this.router.post('/login', validate(loginUserSchema), userController.loginUser),
        this.router.get('/', userController.findAllUsers),
        this.router.get('/:id', userController.findUserById),
        this.router.patch('/:id', userController.updateUser)
    }
}

export default new UserRoutes().router;