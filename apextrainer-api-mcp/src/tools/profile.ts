import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  manageProfileSchema,
  getUserProfileSummarySchema,
  type ManageProfileInput,
} from "../schemas/profile.js";
import * as profileService from "../services/profileService.js";
import { ERRORS } from "../utils/errors.js";
import { formatConfirmation } from "../utils/formatting.js";
import type { ToolResponse } from "../types.js";

const VALID_ACTIONS = [
  "get_profile",
  "update_profile",
  "get_preferences",
  "update_preferences",
];

export function registerProfileTools(server: McpServer, userId: string): void {
  server.registerTool(
    "sparky_get_user_profile_summary",
    {
      title: "Get User Profile Summary",
      description:
        "Get a complete read-only profile summary for the authenticated user, including account information, latest weight, latest height, body fat, timezone, and measurement preferences. Use this when the user asks for their profile, weight, height, or overall personal fitness profile.",
      inputSchema: getUserProfileSummarySchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (): Promise<ToolResponse> => {
      try {
        const profile = await profileService.getProfileSummary(userId);

        const text = `### ApexTrainer Profile

- **Name:** ${profile.name || "N/A"}
- **Email:** ${profile.email || "N/A"}
- **Weight:** ${
          profile.latest_weight
            ? `${profile.latest_weight} ${profile.default_weight_unit || "kg"}`
            : "No weight recorded"
        }
- **Height:** ${
          profile.latest_height
            ? `${profile.latest_height} ${profile.default_measurement_unit || "cm"}`
            : "No height recorded"
        }
- **Body Fat:** ${
          profile.latest_body_fat_percentage
            ? `${profile.latest_body_fat_percentage}%`
            : "Not recorded"
        }
- **Timezone:** ${profile.timezone || "UTC"}
- **Weight Unit:** ${profile.default_weight_unit || "kg"}
- **Measurement Unit:** ${profile.default_measurement_unit || "cm"}
`;

        return {
          content: [{ type: "text", text }],
          structuredContent: profile,
        };
      } catch (error) {
        console.error("[Profile Summary Tool] Error:", error);
        return ERRORS.DB_ERROR();
      }
    }
  );

  server.registerTool(
    "sparky_manage_profile",
    {
      title: "Manage Profile",
      description: `User settings: update display name, timezone, and measurement units.

Actions:
- get_profile() — returns user account details
- update_profile(display_name?, email?, image?) — updates account details
- get_preferences() — returns user preferences
- update_preferences(...) — updates preferences`,
      inputSchema: manageProfileSchema,
    },
    async (rawArgs): Promise<ToolResponse> => {
      const args = rawArgs as unknown as ManageProfileInput;

      try {
        switch (args.action) {
          case "get_profile": {
            const profile = await profileService.getProfile(userId);

            let text = `### User Profile\n\n`;
            text += `- **Name:** ${profile.name || "N/A"}\n`;
            text += `- **Email:** ${profile.email || "N/A"}\n`;
            text += `- **ID:** ${profile.id || "N/A"}\n`;

            return {
              content: [{ type: "text", text }],
              structuredContent: profile,
            };
          }

          case "update_profile": {
            const profile = await profileService.updateProfile(userId, {
              display_name: args.display_name,
              email: args.email,
              image: args.image,
            });

            return formatConfirmation(`Profile updated.`, { profile });
          }

          case "get_preferences": {
            const prefs = await profileService.getPreferences(userId);

            let text = `### User Preferences\n\n`;
            text += `- **Timezone:** ${prefs.timezone || "UTC"}\n`;
            text += `- **Energy Unit:** ${prefs.energy_unit || "kcal"}\n`;
            text += `- **Weight Unit:** ${prefs.default_weight_unit || "kg"}\n`;
            text += `- **Measurement Unit:** ${prefs.default_measurement_unit || "cm"}\n`;
            text += `- **Distance Unit:** ${prefs.default_distance_unit || "km"}\n`;

            return {
              content: [{ type: "text", text }],
              structuredContent: prefs,
            };
          }

          case "update_preferences": {
            const prefs = await profileService.updatePreferences(userId, {
              timezone: args.timezone,
              energy_unit: args.energy_unit,
              default_weight_unit: args.default_weight_unit,
              default_measurement_unit: args.default_measurement_unit,
              default_distance_unit: args.default_distance_unit,
              water_display_unit: args.water_display_unit,
            });

            return formatConfirmation(`Preferences updated.`, {
              preferences: prefs,
            });
          }

          default:
            return ERRORS.INVALID_ACTION(
              String((args as any).action),
              VALID_ACTIONS
            );
        }
      } catch (error) {
        console.error("[Profile Tool] Error:", error);
        return ERRORS.DB_ERROR();
      }
    }
  );
}
