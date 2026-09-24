const express = require("express");

const db = require("../db");

const {
    normalizeString
} = require("../utils/normalize");


const router = express.Router();


/* ============================================================
   旅行の予定一覧
   ============================================================ */

router.get("/trips/:id/schedules", (req, res) => {

    const tripId =
        Number(req.params.id);


    if (!Number.isInteger(tripId) || tripId <= 0) {
        return res.status(400).json({
            error: "Invalid trip id"
        });
    }


    const trip = db.prepare(`
        SELECT id
        FROM trips
        WHERE id = ?
    `).get(tripId);


    if (!trip) {
        return res.status(404).json({
            error: "Trip not found"
        });
    }


    const schedules = db.prepare(`
        SELECT *
        FROM schedules
        WHERE trip_id = ?
        ORDER BY
            sort_order ASC,
            CASE
                WHEN start_at IS NULL OR start_at = '' THEN 1
                ELSE 0
            END,
            start_at ASC,
            id ASC
    `).all(tripId);


    res.json(schedules);
});


/* ============================================================
   予定を作成
   ============================================================ */

router.post("/trips/:id/schedules", (req, res) => {

    const tripId =
        Number(req.params.id);


    if (!Number.isInteger(tripId) || tripId <= 0) {
        return res.status(400).json({
            error: "Invalid trip id"
        });
    }


    const trip = db.prepare(`
        SELECT id
        FROM trips
        WHERE id = ?
    `).get(tripId);


    if (!trip) {
        return res.status(404).json({
            error: "Trip not found"
        });
    }


    const title =
        normalizeString(req.body.title);


    if (!title) {
        return res.status(400).json({
            error: "予定名は必須です"
        });
    }


    const startAt =
        normalizeString(req.body.start_at);


    const endAt =
        normalizeString(req.body.end_at);


    const type =
        normalizeString(req.body.type) ||
        "other";


    const locationName =
        normalizeString(req.body.location_name);


    const description =
        normalizeString(req.body.description);


    const result = db.prepare(`
        INSERT INTO schedules (
            trip_id,
            title,
            start_at,
            end_at,
            type,
            location_name,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        tripId,
        title,
        startAt,
        endAt,
        type,
        locationName,
        description
    );


    const schedule = db.prepare(`
        SELECT *
        FROM schedules
        WHERE id = ?
    `).get(result.lastInsertRowid);


    res.status(201).json(schedule);
});


/* ============================================================
   予定を更新
   ============================================================ */

router.put("/schedules/:id", (req, res) => {

    const id =
        Number(req.params.id);


    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid schedule id"
        });
    }


    const existingSchedule = db.prepare(`
        SELECT *
        FROM schedules
        WHERE id = ?
    `).get(id);


    if (!existingSchedule) {
        return res.status(404).json({
            error: "Schedule not found"
        });
    }


    const title =
        normalizeString(req.body.title);


    if (!title) {
        return res.status(400).json({
            error: "予定名は必須です"
        });
    }


    const startAt =
        normalizeString(req.body.start_at);


    const endAt =
        normalizeString(req.body.end_at);


    const type =
        normalizeString(req.body.type) ||
        "other";


    const locationName =
        normalizeString(req.body.location_name);


    const description =
        normalizeString(req.body.description);


    db.prepare(`
        UPDATE schedules
        SET
            title = ?,
            start_at = ?,
            end_at = ?,
            type = ?,
            location_name = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        title,
        startAt,
        endAt,
        type,
        locationName,
        description,
        id
    );


    const schedule = db.prepare(`
        SELECT *
        FROM schedules
        WHERE id = ?
    `).get(id);


    res.json(schedule);
});


/* ============================================================
   予定を削除
   ============================================================ */

router.delete("/schedules/:id", (req, res) => {

    const id =
        Number(req.params.id);


    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid schedule id"
        });
    }


    const result = db.prepare(`
        DELETE FROM schedules
        WHERE id = ?
    `).run(id);


    if (result.changes === 0) {
        return res.status(404).json({
            error: "Schedule not found"
        });
    }


    res.status(204).end();
});


module.exports = router;