-- Remap legacy free-text layers onto the new blueprint_layer enum values
-- before casting the column (no-op on an empty table)
UPDATE "blueprints" SET "layer" = CASE
	WHEN "layer" IN ('adapter', 'repository', 'schema', 'dto') THEN 'database'
	WHEN "layer" IN ('controller', 'route', 'middleware', 'guard') THEN 'api'
	WHEN "layer" IN ('atom', 'molecule', 'organism', 'page', 'hook', 'component') THEN 'ui'
	WHEN "layer" IN ('testing') THEN 'testing'
	WHEN "layer" IN ('infra') THEN 'infra'
	WHEN "layer" IN ('tooling') THEN 'tooling'
	ELSE 'domain'
END;--> statement-breakpoint
ALTER TABLE "blueprints" ALTER COLUMN "layer" SET DATA TYPE "public"."blueprint_layer" USING "layer"::"public"."blueprint_layer";