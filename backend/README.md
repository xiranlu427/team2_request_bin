# Backend

## Setup

1. Install packages using `npm install`
2. Create an .env file with the keys:
   - HOST
   - PORT
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
3. Create the database and tables using
`psql -d postgres -f db/schema.sql`
4. Start the server with nodemon using `npm start`