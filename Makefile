# Use mingw32-make in windows

SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

.PHONY: db-up db-down db-sync dev seed db-clean seed-more

DB_CONTAINER=modular_model_generator-postgres

db-up:
	docker compose up -d

db-down:
	docker compose down

db-sync:
	npx prisma db push
	npx prisma generate

seed:
	npx tsx scripts/seed.ts

seed-1000:
	npx tsx scripts/seed.ts 1000

db-clean:
	npx tsx scripts/clean.ts

dev: db-up db-sync
	npm run dev
