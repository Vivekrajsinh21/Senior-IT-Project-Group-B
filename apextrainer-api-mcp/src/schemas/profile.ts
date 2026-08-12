import { z } from "zod";

export const manageProfileSchema = z.object({
  action: z.enum([
    "get_profile",
    "update_profile",
    "get_preferences",
    "update_preferences",
  ]).describe(
    "Action to perform. Use get_profile to retrieve the authenticated user's profile."
  ),

  display_name: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("User's display name. Used only for update_profile."),

  email: z
    .string()
    .email()
    .optional()
    .describe("User's email address. Used only for update_profile."),

  image: z
    .string()
    .url()
    .optional()
    .describe("Profile image URL. Used only for update_profile."),

  timezone: z
    .string()
    .optional()
    .describe("User's timezone, e.g. Europe/Berlin."),

  energy_unit: z
    .enum(["kcal", "kJ"])
    .optional(),

  default_weight_unit: z
    .enum(["kg", "lbs"])
    .optional(),

  default_measurement_unit: z
    .enum(["cm", "in"])
    .optional(),

  default_distance_unit: z
    .enum(["km", "miles"])
    .optional(),

  water_display_unit: z
    .enum(["ml", "oz"])
    .optional(),
}).strict();

export type ManageProfileInput = z.infer<typeof manageProfileSchema>;

export const getUserProfileSummarySchema = z.object({}).strict();
