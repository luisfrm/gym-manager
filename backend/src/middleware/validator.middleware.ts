import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateSchema = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.strict().parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.errors.map(error => error.message) });
  }
};