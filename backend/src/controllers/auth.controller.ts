import { Request, Response } from "express";
import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";
import { generateJwt, verifyJwt } from "../utils/jwt";
import getToken from "../utils/getToken";
import { JWT_EXPIRATION_TIME } from "../config";
import { TokenPayload } from "../utils/types";

class AuthController {
  static register = async (req: Request, res: any) => {
    try {
      const { email, password, role, username, name } = req.body;

      const userExists = await Auth.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new Auth({
        email,
        password: hashedPassword,
        username,
        name,
        role: role,
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

      const isPasswordCorrect = bcrypt.compare(password, user.password);

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
}

export default AuthController;
