CREATE TABLE games(
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"width" smallint NOT NULL DEFAULT 20,
	"height" smallint NOT NULL DEFAULT 20,
	"colors" integer NOT NULL DEFAULT 8, 
	"version" varchar(50) NOT NULL DEFAULT '0.1',
	"name" varchar(100) NOT NULL DEFAULT '',
	"status" varchar(100) NOT NULL DEFAULT 'ACTIVE',
	"meta" JSONB DEFAULT '{"status": "ACTIVE", "name": "", "version": "0.1"}'::jsonb NOT NULL,
	"physics" JSONB DEFAULT '{"engine": "normal"}'::jsonb NOT NULL,
	"pixels" JSONB DEFAULT '[]'::jsonb NOT NULL
);

INSERT INTO "games" DEFAULT VALUES RETURNING *;
DROP TABLE "games";
SELECT * FROM "games";