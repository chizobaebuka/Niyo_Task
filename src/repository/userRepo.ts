import { User } from "../models/userModel";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as db from '../config/config';

interface iUserRepo {
  signUp(user: User): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{ user: User | null; token: string | null }>;
  findById(user_id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(user_id: string): Promise<User>;
}

export class UserRepo implements iUserRepo {
  async signUp(user: User): Promise<void> {
    try {
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
        dateOfBirth: user.dateOfBirth,
        country: user.country,
      });

      await newUser.save();
      return;
    } catch (err) {
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
  ): Promise<{ user: User | null; token: string | null }> {
    try {
      const existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        throw new Error("User not found with that email: " + email);
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!passwordMatch) {
        throw new Error("Incorrect password");
      }

      const token = jwt.sign({ id: existingUser.id }, db.JWT_SECRET, {
        expiresIn: "1h",
      });

      return {
        user: existingUser,
        token: token,
      };
    } catch (error: any) {
      throw new Error("Failed to login user: " + error.message);
    }
  }

  async update(user: User): Promise<User> {
    try {
      const newUser = await User.findOne({ where: { id: user.id } });
      if (!newUser) {
        throw new Error("User not found");
      }
      newUser.name = user.name;
      newUser.email = user.email;
      newUser.password = user.password;
      newUser.dateOfBirth = user.dateOfBirth;
      newUser.country = user.country;

      await newUser.save();
      user.save();
      return newUser;
    } catch (err) {
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

  async findById(user_id: string): Promise<User> {
    try {
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error retrieving user:", error);
      throw new Error("Failed to retrieve user by id:");
    }
  }

  async delete(user_id: string): Promise<User> {
    try {
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        throw new Error("User not found");
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
