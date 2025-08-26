# ASS Service

1. Copy `.env.example` to `.env` and set DB credentials and SPRS_BASE_URL.
2. Install deps: `npm install`
3. Create DB schema:
   - Option A: run SQL file: `mysql -u root -p < sql/schema.mysql.sql`
   - Option B: run seeder (this will `sync({ force: true })` and create tables): `npm run seed`
4. Seed sample data: `npm run seed`
5. Start server: `npm start`
6. API docs: http://localhost:4000/docs
