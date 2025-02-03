import { Response, NextFunction } from "express";
import { AppRequest } from "../utils/types";
import getToken from "../utils/getToken";
import { verifyJwt } from "../utils/jwt";

const authMiddleware = (allowedRoles = []) => {
  return async (req: any, res: any, next: NextFunction) => {
    const token = getToken(req);

    if (!token) {
      console.log("No token");
      return res.status(401).json({ message: "Unauthorized. No token" });
    }

    try {
      const decoded = verifyJwt(token);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(401).json({ message: "Access denied. You don't have permission to access this resource." });
    }

    next();
  };
};

export default authMiddleware;
