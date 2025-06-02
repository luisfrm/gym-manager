import { Request, Response } from "express";
import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";
import { AppRequest } from "../utils/types";

class ProfileController {
  // Get current user profile
  static getProfile = async (req: AppRequest, res: any) => {
    try {
      const user = await Auth.findById(req.user.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json(userResponse);
    } catch (error) {
      console.error("Error getting profile:", error);
      return res.status(500).json({ message: "Error al obtener el perfil" });
    }
  };

  // Update user profile
  static updateProfile = async (req: AppRequest, res: any) => {
    try {
      const { username, email } = req.body;
      const userId = req.user.userId;

      // Check if email already exists (excluding current user)
      const emailExists = await Auth.findOne({ 
        email, 
        _id: { $ne: userId } 
      });

      if (emailExists) {
        return res.status(400).json({ message: "El email ya está en uso por otro usuario" });
      }

      // Check if username already exists (excluding current user)
      const usernameExists = await Auth.findOne({ 
        username, 
        _id: { $ne: userId } 
      });

      if (usernameExists) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }

      // Update user profile
      const updatedUser = await Auth.findByIdAndUpdate(
        userId,
        { 
          username, 
          email,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const userResponse = {
        _id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      return res.status(200).json({ 
        message: "Perfil actualizado exitosamente",
        user: userResponse 
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  };

  // Change password
  static changePassword = async (req: AppRequest, res: any) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await Auth.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await Auth.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date()
      });

      return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  };
}

export default ProfileController; 