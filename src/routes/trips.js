const express = require("express");

const db = require("../db");

const {
    normalizeString
} = require("../utils/normalize");


const router = express.Router();


/* ============================================================
   旅行一覧
   ============================================================ */

router.get("/", (req, res) => {

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


/* ============================================================
   旅行詳細
   ============================================================ */

router.get("/:id", (req, res) => {

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


/* ============================================================
   旅行作成
   ============================================================ */

router.post("/", (req, res) => {

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


    const trimmedName =
        name.trim();


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


/* ============================================================
   旅行更新
   ============================================================ */

router.put("/:id", (req, res) => {

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


/* ============================================================
   旅行削除
   ============================================================ */

router.delete("/:id", (req, res) => {

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


module.exports = router;