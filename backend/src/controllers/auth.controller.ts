import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";

class AuthController {
  static register = async (req, res) => {
    try {
      const { email, password, role, gymId } = req.body;

      const userExists = await Auth.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new Auth({
        email,
        password: hashedPassword,
        role: role,
      });

      await user.save();

      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating user" });
    }
  };

  static login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Auth.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isPasswordCorrect = bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    } catch (error) {}
  };
}

export default AuthController;
