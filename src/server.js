const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();

const PORT = process.env.PORT || 3000;
const DATABASE_PATH =
    process.env.DATABASE_PATH || "/app/data/travel-app.db";

const db = new Database(DATABASE_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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


/* ============================================================
   Health
   ============================================================ */

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        app: "travel-app"
    });
});


/* ============================================================
   Trips
   ============================================================ */

/**
 * 旅行一覧
 */
app.get("/api/trips", (req, res) => {
    const trips = db.prepare(`
        SELECT *
        FROM trips
        ORDER BY
            CASE
                WHEN start_date IS NULL OR start_date = '' THEN 1
                ELSE 0
            END,
            start_date DESC,
            id DESC
    `).all();

    res.json(trips);
});


/**
 * 旅行詳細
 */
app.get("/api/trips/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid trip id"
        });
    }

    const trip = db.prepare(`
        SELECT *
        FROM trips
        WHERE id = ?
    `).get(id);

    if (!trip) {
        return res.status(404).json({
            error: "Trip not found"
        });
    }

    res.json(trip);
});


/**
 * 旅行作成
 */
app.post("/api/trips", (req, res) => {
    const {
        name,
        start_date,
        end_date,
        description
    } = req.body;

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "旅行名は必須です"
        });
    }

    const trimmedName = name.trim();

    const result = db.prepare(`
        INSERT INTO trips (
            name,
            start_date,
            end_date,
            description
        )
        VALUES (?, ?, ?, ?)
    `).run(
        trimmedName,
        normalizeString(start_date),
        normalizeString(end_date),
        normalizeString(description)
    );

    const trip = db.prepare(`
        SELECT *
        FROM trips
        WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(trip);
});


/**
 * 旅行更新
 */
app.put("/api/trips/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid trip id"
        });
    }

    const existingTrip = db.prepare(`
        SELECT *
        FROM trips
        WHERE id = ?
    `).get(id);

    if (!existingTrip) {
        return res.status(404).json({
            error: "Trip not found"
        });
    }

    const {
        name,
        start_date,
        end_date,
        description
    } = req.body;

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "旅行名は必須です"
        });
    }

    db.prepare(`
        UPDATE trips
        SET
            name = ?,
            start_date = ?,
            end_date = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        name.trim(),
        normalizeString(start_date),
        normalizeString(end_date),
        normalizeString(description),
        id
    );

    const trip = db.prepare(`
        SELECT *
        FROM trips
        WHERE id = ?
    `).get(id);

    res.json(trip);
});


/**
 * 旅行削除
 */
app.delete("/api/trips/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid trip id"
        });
    }

    const result = db.prepare(`
        DELETE FROM trips
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Trip not found"
        });
    }

    res.status(204).end();
});


/* ============================================================
   Utility
   ============================================================ */

function normalizeString(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
}


/* ============================================================
   Server
   ============================================================ */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Travel App listening on port ${PORT}`);
});