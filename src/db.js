const Database = require("better-sqlite3");

const DATABASE_PATH =
    process.env.DATABASE_PATH ||
    "/app/data/travel-app.db";


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

        CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,

        title TEXT NOT NULL,

        type TEXT NOT NULL DEFAULT 'other',

        start_at TEXT,
        end_at TEXT,

        location_name TEXT,
        address TEXT,

        latitude REAL,
        longitude REAL,

        external_url TEXT,

        memo TEXT,

        priority TEXT NOT NULL DEFAULT 'normal',

        visited INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (trip_id)
            REFERENCES trips(id)
            ON DELETE CASCADE
    );
`);

/* ============================================================
   schedules テーブルの追加カラム
   ============================================================ */

const scheduleColumns =
    db.prepare(`
        PRAGMA table_info(schedules)
    `).all();

const scheduleColumnNames =
    scheduleColumns.map(
        column => column.name
    );


if (!scheduleColumnNames.includes("address")) {

    db.exec(`
        ALTER TABLE schedules
        ADD COLUMN address TEXT
    `);

}


if (!scheduleColumnNames.includes("external_url")) {

    db.exec(`
        ALTER TABLE schedules
        ADD COLUMN external_url TEXT
    `);

}


if (!scheduleColumnNames.includes("priority")) {

    db.exec(`
        ALTER TABLE schedules
        ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'
    `);

}


module.exports = db;