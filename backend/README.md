# Backend

## Setup

1. Install packages using `npm install`
2. Create an .env file with the keys:
  - HOST="localhost"
  - PORT="3000"
  - PGUSER
  - PGPASSWORD
  - PGDATABASE="request_bin"
  - MONGO_URI="mongodb://localhost:27017"
  - MONGO_DB_NAME="request_bin"
  - MONGO_COLLECTION_NAME="request_bodies"
3. Create the database and tables and fill with seed data using
  - `psql -d postgres -f db/schema.sql`
  - `psql -d request_bin -f db/seed_data.sql`
4. [Install MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) if you haven't already. Start a local mongo server (instructions at link).
5. Start the server with nodemon using `npm start`