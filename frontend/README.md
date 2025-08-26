    # AFRS Kiosk Frontend

Full-screen kiosk React frontend for AFRS Microservice.

- Uses `/match/` and `/enroll/` endpoints (multipart/form-data).
- Sends API key via `x-api-key` header.
- 3-second face scan, camera-first UI.
- On no-match: temporary registration modal to enroll patient (POST /enroll/).
- On match: shows patient info and appointments if present.

## Setup
1. Copy `.env.example` to `.env` and set variables.
2. Install: `npm install`
3. Dev: `npm run dev`
