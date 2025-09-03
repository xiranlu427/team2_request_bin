# Backend

## Setup

1. Install packages using `npm install`
2. Create an .env file with the keys:
   - HOST
   - PORT
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
3. Create the database and tables and fill with seed data using
    - `psql -d postgres -f db/schema.sql`
    - `psql -d request_bin -f db/seed_data.sql`
4. Start the server with nodemon using `npm start`
