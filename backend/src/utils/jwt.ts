import jwt, { JwtPayload } from "jsonwebtoken";
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
    console.error("Error verifying JWT:", error);
    throw new Error("Error verifying JWT");
  }
};

export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded || !decoded.exp) {
      return true; // If there's no expiration, assume it's expiring soon
    }
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    return timeUntilExpiration < thresholdMinutes * 60 * 1000; // Check if it's within the threshold minutes
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Assume it's expiring soon if there's an error
  }
};
