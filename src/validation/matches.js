import { z } from "zod";

/**
 * Constants
 */
export const MATCH_STATUS = {
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished",
};

/**
 * Helper: ISO Date Validation
 */
const isoDateString = z.iso.datetime({
    message: "Invalid ISO date string",
});

/**
 * Schemas
 */

// Validates query parameters for listing matches
export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

// Validates the ID parameter in URL paths
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// Validates the creation of a new match with chronological enforcement
export const createMatchSchema = z
    .object({
        sport: z.string().min(1, "Sport is required"),
        homeTeam: z.string().min(1, "Home team is required"),
        awayTeam: z.string().min(1, "Away team is required"),
        startTime: isoDateString,
        endTime: isoDateString,
        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
        const start = new Date(data.startTime).getTime();
        const end = new Date(data.endTime).getTime();

        if (end <= start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End time must be chronologically after start time",
                path: ["endTime"],
            });
        }
    });

// Validates score updates
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
});
