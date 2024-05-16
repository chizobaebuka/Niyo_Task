import { NextFunction, Response, Request } from "express";
import {
  HTTP_STATUS_CODE,
  JWT_EXPIRATION_STATUS_CODE,
  JWT_INVALID_STATUS_CODE,
} from '../constants';
import { User } from "../models/userModel";
import { Jwt } from "../utils/helpers";

export interface RequestExt extends Request {
  body: Request["body"] & {
    _user?: User;
    _userId?: string;
  };
  params: Request["params"] & {
    _taskId?: string;
  };
}

export const authorizationMiddleware = async (
  req: RequestExt,
  res: Response,
  next: NextFunction
) => {
  const authorization = req?.headers?.authorization;

  if (!authorization) {
    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
      message: ["Unauthorized access:", "Token is missing"],
      code: JWT_INVALID_STATUS_CODE,
    });
  }

  const token = authorization.split(" ")[1] as string;

  const { data, expired, valid } = await Jwt.isTokenExpired<User>(token);

  if (!expired && valid) {
    req.body["_userId"] = data.id;

    req.body["_user"] = await User.findOne({
      where: { id: data.id },
    });
    return next();
  }
  return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
    message: "Unauthorized access",
    code: valid ? JWT_EXPIRATION_STATUS_CODE : JWT_INVALID_STATUS_CODE,
  });
};