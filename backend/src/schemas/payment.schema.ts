import { z } from "zod";

export const paymentSchema = z.object({
  clientId: z.string({
    required_error: "Client ID is required.",
    invalid_type_error: "Client ID must be a string.",
  }),
  amount: z.number({
    required_error: "Amount is required.",
    invalid_type_error: "Amount must be a number.",
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
    required_error: "Payment reference is required.",
    invalid_type_error: "Payment reference must be a string.",
  }),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  currency: z.enum(["USD", "Bs"], {
    required_error: "Currency is required.",
    invalid_type_error: "Currency must be a string.",
  }),
});
