import { Router } from "express";
import {
    createMatchSchema,
    listMatchesQuerySchema,
} from "../validation/matches.js"; // Added .js
import { matches } from "../db/schema.js"; // Added .js
import { db } from "../db/db.js"; // Added .js
import { getMatchStatus } from "../utils/match-status.js"; // Added .js
import { desc } from "drizzle-orm";

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    const MAX_LIMIT = 100;

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query",
            details: parsed.error.format(),
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit);

        res.json({ data });
    } catch (error) {
        res.status(500).json({
            error: "Failed to list matches",
            message: "A database error occurred while fetching matches.",
        });
    }
});

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid match payload",
            details: parsed.error.format(),
        });
    }

    const { startTime, endTime, homeScore, awayScore, ...rest } = parsed.data;

    try {
        const [event] = await db
            .insert(matches)
            .values({
                ...rest,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status: getMatchStatus(startTime, endTime),
            })
            .returning();

        if (typeof res.app.locals.broadcastMatchCreated === "function") {
            res.app.locals.broadcastMatchCreated(event);
        }
        res.status(201).json({ data: event });
    } catch (error) {
        console.error("Database Insert Error:", error);
        res.status(500).json({
            error: "Failed to create match",
            message: "A database error occurred while saving the match.",
        });
    }
});
