import jwt from "jsonwebtoken";
import { JWT_EXPIRATION_TIME, TOKEN_SECRET_JWT } from "../config";

export const generateJwt = (payload: object) => {
  if (!payload) throw new Error("No payload provided");

  try {
    const token = jwt.sign(payload, TOKEN_SECRET_JWT, { expiresIn: JWT_EXPIRATION_TIME });

    return token;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error("Error generating JWT");
  }
};

export const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET_JWT);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Error verifying JWT");
  }
};
