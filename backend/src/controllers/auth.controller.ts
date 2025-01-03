import { Request, Response } from "express";
import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";
import { generateJwt } from "../utils/jwt";

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

      const token = generateJwt({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      const userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      };

      res.status(200).json({ token, user: userResponse });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  };
}

export default AuthController;
