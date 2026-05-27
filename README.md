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

**To Upload the drivers :**

1) start the server using npm run dev in terminal.
2) Two ways to upload the drivers :
    a) use CURL command in separate terminal
        curl -X POST http://localhost:3000/api/drivers \
  -F "drivers=@drivers.csv"
    b) Use postman and select drivers file with form-data.

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

**To Update the delivery events :**

1) start the server using npm run dev in terminal.
2) Two ways to upload the drivers :
    a) use CURL command in separate terminal
       curl -X POST http://localhost:3000/api/delivery-events \
  -H "Content-Type: application/json" \
  -d '{"packageId": "PKG3456", "driverID": 5, "status": "picked_up", "timestamp": "2026-05-24T11:00:00Z"}'
    b) Use postman and set json in the body.
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

**To get the delivery statistics :**

1) start the server using npm run dev in terminal.
2) Two ways to upload the drivers :
    a) use CURL command in separate terminal
        curl "http://localhost:3000/api/delivery-statistics?metric=total_packages&startDate=2026-05-01&endDate=2026-05-31"
       # With driver filter
        curl "http://localhost:3000/api/delivery-statistics?metric=delivery_rate&startDate=2026-05-01&endDate=2026-05-31&driverIds=1,2,3"

       # With region filter
        curl "http://localhost:3000/api/delivery-statistics?metric=failure_rate&startDate=2026-05-01&endDate=2026-05-31&regions=north,south"

       # Average deliveries per day
       curl "http://localhost:3000/api/delivery-statistics?metric=avg_deliveries_per_day&startDate=2026-05-01&endDate=2026-05-07"
    b) Use postman and set json in the body.


## GET drivers and delivery-events table data

1.) GET drivers table data
    
    curl 'https://ctcmmonsbiurvxbbvvzs.supabase.co/rest/v1/drivers?select=*' \
-H "apikey: SUPABASE_KEY" \
-H "Authorization: Bearer SUPABASE_KEY"

2.) GET delivery events table data

    curl 'https://ctcmmonsbiurvxbbvvzs.supabase.co/rest/v1/delivery_events?select=*' \
-H "apikey: SUPABASE_KEY" \
-H "Authorization: Bearer SUPABASE_KEY"

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
