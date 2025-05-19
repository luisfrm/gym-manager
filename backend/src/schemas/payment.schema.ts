import { z } from "zod";

export const paymentSchema = z.object({
  client: z.string({
    required_error: "Client is required.",
    invalid_type_error: "Client must be a string.",
  }),
  amount: z.number({
    required_error: "Amount is required.",
    invalid_type_error: "Amount must be a number.",
  }),
  clientCedula: z.string({
    required_error: "Client cedula is required.",
    invalid_type_error: "Client cedula must be a string.",
  }),
  date: z.string({
    required_error: "Date is required.",
    invalid_type_error: "Date must be a string.",
  }),
  service: z.string({
    required_error: "Service is required.",
    invalid_type_error: "Service must be a string.",
  }),
  description: z
    .string({
      invalid_type_error: "Description must be a string.",
    })
    .default(""),
  paymentMethod: z.string({
    required_error: "Payment method is required.",
    invalid_type_error: "Payment method must be a string.",
  }),
  paymentReference: z.string({
    invalid_type_error: "Payment reference must be a string.",
  }),
  expiredDate: z.string({
    invalid_type_error: "Expired date must be a string.",
  }),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  currency: z.enum(["USD", "VES"], {
    required_error: "Currency is required.",
    invalid_type_error: "Currency must be a string.",
  }),
});

export const paymentPartialSchema = z.object({
  client: z.string().nonempty().optional(),
  amount: z.number().refine(value => value > 0, {
    message: "Amount must be greater than zero",
  }).optional(),
  date: z.string().nonempty().optional(),
  service: z.string().nonempty().optional(),
  description: z.string().nonempty().optional(),
  paymentMethod: z.string().nonempty().optional(),
  paymentReference: z.string().optional(),
  expiredDate: z.string().nonempty().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending").optional(),
  currency: z.enum(["USD", "VES"]).optional(),
});
