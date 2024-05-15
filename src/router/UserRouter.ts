import userController from "../controller/userController";
import { createUserSchema } from "../schema/UserSchema";
import validate from "../utils/validate";
// import validate from "../helpers/validate";
// import { createUserSchema, loginUserSchema, updateUserSchema } from "../schema/userSchema";
import BaseRoutes from "./base/BaseRouter";


class UserRoutes extends BaseRoutes {

    public routes(): void {
        this.router.post("/", userController.createUser)
        
    }
}

export default new UserRoutes().router;