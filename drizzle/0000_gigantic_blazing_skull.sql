CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'finished');

CREATE TABLE "commentary" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"minute" integer,
	"sequence" integer NOT NULL,
	"period" varchar(50),
	"event_type" varchar(50),
	"actor" varchar(255),
	"team" varchar(255),
	"message" text NOT NULL,
	"metadata" jsonb,
	"tags" text[],
	"created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport" varchar(50) NOT NULL,
	"home_team" varchar(255) NOT NULL,
	"away_team" varchar(255) NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"start_time" timestamptz NOT NULL,
	"end_time" timestamptz NOT NULL,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
	CONSTRAINT "matches_end_after_start_chk" CHECK ("end_time" > "start_time")
);

ALTER TABLE "commentary" ADD CONSTRAINT "commentary_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "match_timeline_idx" ON "commentary" USING btree ("match_id","sequence");
CREATE INDEX "status_idx" ON "matches" USING btree ("status");
CREATE INDEX "sport_idx" ON "matches" USING btree ("sport");