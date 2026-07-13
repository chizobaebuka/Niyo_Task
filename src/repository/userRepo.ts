import { User } from "../models/userModel";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as db from '../config/config';

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  password?: string; // pre-hashed by the caller
  dateOfBirth?: Date | string;
  country?: string;
}

export interface UserSignUpPayload {
  name: string;
  email: string;
  password: string; // pre-hashed by the caller
  dateOfBirth: Date | string;
  country: string;
}

interface iUserRepo {
  signUp(user: UserSignUpPayload): Promise<User>;
  login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }>;
  findById(user_id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user_id: string, updates: UserUpdatePayload): Promise<User>;
  delete(user_id: string): Promise<User | null>;
}

export class UserRepo implements iUserRepo {
  async signUp(user: UserSignUpPayload): Promise<User> {
    try {
      return await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
        dateOfBirth: user.dateOfBirth,
        country: user.country,
      });
    } catch (err: any) {
      if (err?.name === "SequelizeUniqueConstraintError") {
        throw new Error("Email already in use");
      }
      if (err instanceof Error) {
        console.log(err);
        throw new Error("Failed to create user: " + err.message);
      } else {
        console.log(err);
        throw new Error("Failed to create user: Unknown error occurred");
      }
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    // Deliberately identical error for "no such user" and "wrong password" to avoid leaking which emails are registered.
    const invalidCredentialsError = new Error("Invalid email or password");

    const existingUser = await User.scope("withPassword").findOne({ where: { email } });
    if (!existingUser) {
      throw invalidCredentialsError;
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      throw invalidCredentialsError;
    }

    const token = jwt.sign({ id: existingUser.id }, db.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      user: existingUser,
      token,
    };
  }

  async update(userId: string, updates: UserUpdatePayload): Promise<User> {
    try {
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.email !== undefined) user.email = updates.email;
      if (updates.password !== undefined) user.password = updates.password;
      if (updates.dateOfBirth !== undefined) user.dateOfBirth = updates.dateOfBirth as any;
      if (updates.country !== undefined) user.country = updates.country;

      await user.save();
      return user;
    } catch (err: any) {
      if (err?.name === "SequelizeUniqueConstraintError") {
        throw new Error("Email already in use");
      }
      if (err instanceof Error) {
        console.log(err);
        throw new Error("Failed to update user: " + err.message);
      } else {
        console.log(err);
        throw new Error("Failed to update user: Unknown error occurred");
      }
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await User.findAll();
    } catch (error) {
      console.error("Error retrieving users:", error);
      throw new Error("Failed to retrieve users");
    }
  }

  async findById(user_id: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { id: user_id } });
    } catch (error) {
      console.error("Error retrieving user:", error);
      throw new Error("Failed to retrieve user by id:");
    }
  }

  async delete(user_id: string): Promise<User | null> {
    try {
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        return null;
      }

      await user.destroy();
      return user;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }
}

export const userRepo = new UserRepo;
