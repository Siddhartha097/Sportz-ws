import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    pgEnum,
    jsonb,
    index,
    varchar,
} from "drizzle-orm/pg-core";

/**
 * Match Status Enum
 * Defines the lifecycle of a sporting event.
 */
export const matchStatusEnum = pgEnum("match_status", [
    "scheduled",
    "live",
    "finished",
]);

/**
 * Matches Table
 * Stores core information for any sporting event.
 */
export const matches = pgTable(
    "matches",
    {
        id: serial("id").primaryKey(),
        sport: varchar("sport", { length: 50 }).notNull(),
        homeTeam: varchar("home_team", { length: 255 }).notNull(),
        awayTeam: varchar("away_team", { length: 255 }).notNull(),
        status: matchStatusEnum("status").default("scheduled").notNull(),
        startTime: timestamp("start_time"),
        endTime: timestamp("end_time"),
        homeScore: integer("home_score").default(0).notNull(),
        awayScore: integer("away_score").default(0).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            // Indexing status and sport for quick filtering on dashboards
            statusIdx: index("status_idx").on(table.status),
            sportIdx: index("sport_idx").on(table.sport),
        };
    },
);

/**
 * Commentary Table
 * Stores real-time play-by-play updates.
 */
export const commentary = pgTable(
    "commentary",
    {
        id: serial("id").primaryKey(),
        matchId: integer("match_id")
            .notNull()
            .references(() => matches.id, { onDelete: "cascade" }),
        minute: integer("minute"),
        sequence: integer("sequence").notNull(), // Used to maintain order if timestamps are identical
        period: varchar("period", { length: 50 }), // e.g., '1st Half', 'Quarter 3'
        eventType: varchar("event_type", { length: 50 }), // e.g., 'goal', 'card', 'substitution'
        actor: varchar("actor", { length: 255 }), // The player or official involved
        team: varchar("team", { length: 255 }), // The team associated with the event
        message: text("message").notNull(),
        metadata: jsonb("metadata"), // Sport-specific data (e.g., ball speed, shot location)
        tags: text("tags").array(), // Useful for filtering (e.g., ['highlight', 'var'])
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            // Composite index for fast retrieval of a specific match's timeline
            matchTimelineIdx: index("match_timeline_idx").on(
                table.matchId,
                table.sequence,
            ),
        };
    },
);
