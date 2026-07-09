/**
 * Validation Middleware — Zod schemas for all auth endpoints
 * File: backend/middleware/validate.js
 *
 * Install: npm install zod xss
 *
 * Usage:
 *   const { validateLogin, validateRegister } = require("./middleware/validate");
 *   router.post("/login", validateLogin, authController.login);
 */

const { z } = require("zod");
const xss = require("xss");

// ─── XSS sanitizer ───────────────────────────────────────────────────────────

function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return xss(str.trim(), {
    whiteList: {}, // strip ALL html tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    clean[k] = typeof v === "string" ? sanitizeString(v) : v;
  }
  return clean;
}

// ─── Password strength ────────────────────────────────────────────────────────

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long")
  .refine((p) => /[A-Z]/.test(p), {
    message: "Password must contain an uppercase letter",
  })
  .refine((p) => /[0-9]/.test(p), { message: "Password must contain a number" })
  .refine((p) => /[^A-Za-z0-9]/.test(p), {
    message: "Password must contain a special character",
  });

// Allow weaker passwords for existing users (backward compat on login)
const anyPassword = z.string().min(1, "Password is required").max(72);

// ─── Schemas ──────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .toLowerCase(),
  password: strongPassword,
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase(),
  password: anyPassword,
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase(),
});

const ResetPasswordSchema = z.object({
  password: strongPassword,
});

const ChangePasswordSchema = z
  .object({
    currentPassword: anyPassword,
    newPassword: strongPassword,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

const UpdateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")
      .optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    address: z
      .object({
        street: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        pincode: z
          .string()
          .regex(/^\d{6}$/, "Invalid pincode")
          .optional()
          .or(z.literal("")),
      })
      .optional(),
    preferences: z
      .object({
        vehicleType: z.enum(["car", "bike", "any"]).optional(),
        fuelType: z.enum(["petrol", "diesel", "electric", "any"]).optional(),
        maxBudget: z.number().min(0).max(1000000).optional(),
      })
      .optional(),
    avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  })
  .strict();

// ─── Middleware factory ───────────────────────────────────────────────────────

function validate(schema) {
  return (req, res, next) => {
    // 1. Sanitize all string fields first
    req.body = sanitizeObject(req.body);

    // 2. Parse with Zod
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Return generic 400 — don't leak which field failed in production
      const isDev = process.env.NODE_ENV === "development";
      const details = isDev
        ? result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        : undefined;

      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        ...(isDev && { details }),
      });
    }

    // 3. Replace body with validated + sanitized data
    req.body = result.data;
    next();
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  validateRegister: validate(RegisterSchema),
  validateLogin: validate(LoginSchema),
  validateForgotPassword: validate(ForgotPasswordSchema),
  validateResetPassword: validate(ResetPasswordSchema),
  validateChangePassword: validate(ChangePasswordSchema),
  validateUpdateProfile: validate(UpdateProfileSchema),
  sanitizeString,
  sanitizeObject,
};
