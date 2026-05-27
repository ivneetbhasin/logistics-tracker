<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines

## Project Overview

Logistics Tracker — a delivery tracking and analytics REST API built with Next.js 16 App Router, TypeScript, Supabase, and Zod.

## Tech Stack

- Next.js 16 (App Router, `src/app/api/` route handlers)
- TypeScript (strict)
- Supabase (PostgreSQL via `@supabase/supabase-js`)
- Zod for request validation
- csv-parse for CSV ingestion
- Jest + ts-jest for testing
- Tailwind CSS for styling

## Project Structure

```
src/
├── app/api/          # Route handlers (POST /drivers, POST /delivery-events, GET /delivery-statistics)
├── app/              # deliveryConstants.ts, page.tsx
├── lib/              # supabase.ts client
├── validators/       # Zod schemas (driver, deliveryEvent, deliveryStatistics)
├── mocks/            # Jest mocks (supabase)
└── tests/            # Test files mirroring API structure
```

## Coding Conventions

- Use default exports for the Supabase client (`import supabase from '../../../lib/supabase'`)
- Route handlers export named async functions (`GET`, `POST`) from `route.ts`
- Validation schemas live in `src/validators/` and export both the schema and inferred type
- Constants (regions, metrics, statuses) are defined in `src/app/deliveryConstants.ts` as `const` arrays
- Use `NextRequest` and `NextResponse` from `next/server`
- Error responses follow the shape `{ success: false, error: string }` or `{ success: false, errors: ZodIssue[] }`
- Success responses follow the shape `{ success: true, ... }`

## Validation Rules

- All request validation uses Zod `safeParse` — never throw on invalid input
- Return 400 with `errors` array for validation failures
- Coerce numeric fields from strings using `z.coerce.number()`
- Allowed regions: `north`, `south`, `east`, `west`
- Allowed metrics: `total_packages`, `delivery_rate`, `failure_rate`, `avg_deliveries_per_day`
- Allowed statuses: `picked_up`, `in_transit`, `delivered`, `failed`, `returned`

## Database

- Tables: `drivers`, `delivery_events`
- `drivers` columns: `driverID` (PK), `name`, `phone`, `email`, `region`
- `delivery_events` columns: `package_id`, `driverID` (FK), `status`, `event_timestamp`
- Driver upsert uses `onConflict: 'driverID'`
- Delivery events join drivers via `drivers!inner(region)` for region filtering

## Testing Conventions

- Test files live in `src/tests/<feature>/`
- Mock Supabase at module level with `jest.mock('../../lib/supabase', ...)`
- Use a `mockResult` function to control Supabase query responses
- Use `createRequest()` helper to build `NextRequest` objects with query params
- Run tests: `npm test`
- Run with coverage: `npm run test:coverage`
