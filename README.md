# expenses-sheets-api

A small Node.js (Fastify) backend service that appends new expense entries to a Google Spreadsheet.

It exists to serve:
- a mobile app
- another backend service

## What it does

- Exposes a single endpoint: `POST /expenses`
- Requires an auth token via the `Authorization` header (**no `Bearer` prefix**)
- Validates the payload (category + amount)
- Appends a new row to a Google Sheet using the Google Sheets API

The row appended looks like:

| Category (name) | Amount | Date (YYYY-MM-DD) | Description |
|---|---:|---|---|
| e.g. `Supermarket` | e.g. `42.50` | e.g. `2026-03-14` | e.g. `Groceries` |

## Tech stack

- Node.js (ESM)
- Fastify
- googleapis
- dotenv

## Requirements

- Node.js 18+ recommended
- A Google Cloud service account with access to your target spreadsheet
- A Google Spreadsheet ID and a sheet/tab set up for expenses

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
PORT=3000
TOKEN=your-secret-token

# Google Sheets
SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_CREDENTIALS={"type":"service_account", ...}
```

**Environment variables:**

- `PORT` - Port where the Fastify server will listen.
- `TOKEN` - Token required in the `Authorization` header for all requests.
- `SPREADSHEET_ID` - The Google Spreadsheet ID.
- `GOOGLE_CREDENTIALS` - The service account JSON **as a string** (must be valid JSON).

Notes:
- `GOOGLE_CREDENTIALS` is parsed with `JSON.parse(process.env.GOOGLE_CREDENTIALS)`, so it must be a valid JSON string.
- Make sure the service account email has permission to edit the spreadsheet (share the spreadsheet with the service account email).

### 3) Spreadsheet range used by this service

This service appends to:

- Sheet/tab name: `expenses 2026`
- Range: `P:S`

So data will be appended into columns **P, Q, R, S** in that tab.

If your spreadsheet differs (tab name or columns), update it in `src/sheets.js`.

## Running

```bash
npm start
```

The server binds to `0.0.0.0` and logs:

```text
Server listening on port <PORT>
```

## API

### Authentication

All requests must include the header:

- `Authorization: <TOKEN>`

Important: **do not** use `Bearer <token>`; the server compares the header value directly to `process.env.TOKEN`.

If the token is missing or invalid, the API responds with:

- `401 Unauthorized`
- Body: `{ "error": "Unauthorized" }`

### POST `/expenses`

Registers a new expense and appends it to the spreadsheet.

#### Request body

JSON payload:

```json
{
  "category": "sf",
  "amount": 42.50,
  "date": "2026-03-14",
  "description": "Groceries"
}
```

Fields:

- `category` (required): category code (string). The server lowercases + trims it.
- `amount` (required): must be `> 0`
- `date` (optional): `YYYY-MM-DD`
  - If omitted, the server uses **today's date** in `YYYY-MM-DD`
- `description` (optional): string (can be omitted)

#### Category codes

| Code | Category written to the spreadsheet |
|------|-------------------------------------|
| `en` | Entertainment |
| `sf` | Supermarket |
| `ff` | Fast Food |
| `ch` | Charity |
| `he` | Self Care |
| `ed` | Education |
| `mt` | Motorbike Maintenance |
| `cl` | Clothes |
| `ot` | Other |

If an invalid category code is provided, the API responds with:

- `400 Bad Request`
- Body: `{ "error": "Invalid category" }`

If `category` is missing:

- `400 Bad Request`
- Body: `{ "error": "Category is required" }`

If `amount <= 0`:

- `400 Bad Request`
- Body: `{ "error": "Invalid amount" }`

#### Responses

Success:

- `201 Created`
- Body: `{ "status": "new expense recorded" }`

#### Example curl

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: your-secret-token" \
  -d '{
    "category": "sf",
    "amount": 42.50,
    "description": "Groceries"
  }'
```
