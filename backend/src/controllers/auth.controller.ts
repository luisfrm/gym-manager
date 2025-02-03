import { Request, Response } from "express";
import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";
import { generateJwt, verifyJwt } from "../utils/jwt";
import getToken from "../utils/getToken";
import { JWT_EXPIRATION_TIME } from "../config";
import { AppRequest, TokenPayload } from "../utils/types";

class AuthController {
  static register = async (req: Request, res: any) => {
    try {
      const { email, password, role, username, name } = req.body;

      const userEmailExists = await Auth.findOne({ email });

      if (userEmailExists) {
        return res.status(400).json({ message: "User email already exists" });
      }

      const userUsernameExists = await Auth.findOne({ username });

      if (userUsernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new Auth({
        email,
        password: hashedPassword,
        username,
        name,
        role,
      });

      await user.save();

      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating user" });
    }
  };

  static login = async (req: Request, res: any) => {
    try {
      const { email, password } = req.body;

      const user = await Auth.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Email o contraseña inválidos." });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Email o contraseña inválidos." });
      }

      const tokenExpiration = new Date(Date.now() + JWT_EXPIRATION_TIME * 1000);

      const token = generateJwt({
        userId: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
        tokenExpiration,
      });

      const userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      };

      res.status(200).json({ token, user: userResponse, tokenExpiration });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  };

  static validateToken = async (req: Request, res: any) => {
    try {
      const token = getToken(req);
      const decoded = verifyJwt(token);
      res.status(200).json(decoded);
    } catch (error) {
      console.log(error.message);
      res.status(401).json({ message: "Token invalid." });
    }
  };

  static refreshToken = async (req: Request, res: any) => {
    try {
      const token = getToken(req);
      const decoded = verifyJwt(token) as TokenPayload;
      const tokenExpiration = new Date(Date.now() + JWT_EXPIRATION_TIME * 1000);
      const newToken = generateJwt({
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        username: decoded.username,
        tokenExpiration,
      });
      res.status(200).json({ token: newToken, tokenExpiration });
    } catch (error) {
      console.log(error.message);
      if (error.message === "Token expired") {
        res.status(401).json({ message: "Token expirado" });
      } else {
        res.status(401).json({ message: "Token inválido" });
      }
    }
  };

  static changePassword = async (req: AppRequest, res: any) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await Auth.findById({ _id: req.user.userId });

      if (!user) {
        return res.status(400).json({ message: "Usuario inválido" });
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Contraseña inválida." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await Auth.findByIdAndUpdate(user.id, {
        password: hashedPassword,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error changing password" });
    }
  };
}

export default AuthController;
