# Logistics Tracker

A delivery tracking and analytics platform built with Next.js, React, TypeScript, and Supabase.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **CSV Parsing:** csv-parse
- **Testing:** Jest + ts-jest
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

npm install

### Development

npm run dev

### Build

npm run build
npm start

## API Endpoints

### POST /api/drivers

Upload drivers via CSV file.

**Request:** `multipart/form-data` with a `drivers` field containing a `.csv` file.

**CSV columns:**

| Column   | Type    | 
|----------|---------|
| driverID | integer |
| name     | string  |
| phone    | string  | 
| email    | string  |
| region   | string  |

Sample csv file is saved in drivers.csv in project.


---

### POST /api/delivery-events

Record a delivery event.

**Request body (JSON):**

| Field     | Type   | 
|-----------|--------|
| packageId | string |
| driverID  | integer|
| status    | string |
| timestamp | string |

Samle JSON request

{
  "packageId": "PKG3456",
  "driverID": 5,
  "status": "picked_up",
  "timestamp": "2026-05-24T11:00:00Z"
}

---

### GET /api/delivery-statistics

Query delivery analytics with optional filters.

**Query parameters:**

| Parameter | Type   | Required |
|-----------|--------|----------|
| metric    | string | No       |
| startDate | string | No       |
| endDate   | string | No       |
| driverIds | string | No       |
| regions   | string | No       |

**Metrics:**

- `total_packages` — Count of unique packages in the date range
- `delivery_rate` — Percentage of events with status `delivered`
- `failure_rate` — Percentage of events with status `failed`
- `avg_deliveries_per_day` — Average delivered events per day in the range

## Testing

# Run all tests
npm test

# With coverage report
npm run test:coverage

## Project Structure

src/
├── app/
│   ├── api/
│   │   ├── drivers/route.ts
│   │   ├── delivery-events/route.ts
│   │   └── delivery-statistics/route.ts
│   ├── deliveryConstants.ts
│   └── page.tsx
├── lib/
│   └── supabase.ts
├── validators/
│   ├── driver.validator.ts
│   ├── deliveryEvent.validator.ts
│   └── deliveryStatistics.validator.ts
└── tests/
    ├── drivers/
    ├── delivery-events/
    └── delivery-statistics/
