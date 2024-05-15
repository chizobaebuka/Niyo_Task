import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { HTTP_STATUS_CODE } from "../constants";


const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error: any) {
        const err_message = JSON.parse(error.message);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
            status: HTTP_STATUS_CODE.BAD_REQUEST,
            message: err_message[0].message, 
        });
    }
};

export default validate;