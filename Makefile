# Use mingw32-make in windows

SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

.PHONY: db-up db-down db-sync dev seed db-clean

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

db-clean:
	npx tsx scripts/clean.ts

dev: db-up db-sync
	npm run dev
