const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();

const PORT = process.env.PORT || 3000;
const DATABASE_PATH =
    process.env.DATABASE_PATH || "/app/data/travel-app.db";

const db = new Database(DATABASE_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        start_at TEXT,
        end_at TEXT,
        type TEXT NOT NULL DEFAULT 'other',
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (trip_id)
            REFERENCES trips(id)
            ON DELETE CASCADE
    );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        app: "travel-app"
    });
});

app.get("/api/trips", (req, res) => {
    const trips = db.prepare(`
        SELECT *
        FROM trips
        ORDER BY start_date DESC, id DESC
    `).all();

    res.json(trips);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Travel App listening on port ${PORT}`);
});
