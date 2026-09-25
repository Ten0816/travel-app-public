const express = require("express");

const db = require("../db");

const {
  normalizeString
} = require("../utils/normalize");

const router = express.Router();


/* ============================================================
   候補イベント一覧
   ============================================================ */

router.get("/trips/:id/events", (req, res) => {

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


  const events = db.prepare(`
        SELECT *
        FROM events
        WHERE trip_id = ?
        ORDER BY
            visited ASC,
            CASE
                WHEN start_at IS NULL OR start_at = '' THEN 1
                ELSE 0
            END,
            start_at ASC,
            id ASC
    `).all(tripId);


  res.json(events);
});


/* ============================================================
   候補イベント作成
   ============================================================ */

router.post("/trips/:id/events", (req, res) => {

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
      error: "イベント名は必須です"
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


  const address =
    normalizeString(req.body.address);


  const externalUrl =
    normalizeString(req.body.external_url);


  const memo =
    normalizeString(req.body.memo);


  const priority =
    req.body.priority === "high"
      ? "high"
      : "normal";


  const visited =
    req.body.visited ? 1 : 0;


  const result = db.prepare(`
        INSERT INTO events (
            trip_id,
            title,
            type,
            start_at,
            end_at,
            location_name,
            address,
            external_url,
            memo,
            priority,
            visited
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
    tripId,
    title,
    type,
    startAt,
    endAt,
    locationName,
    address,
    externalUrl,
    memo,
    priority,
    visited
  );


  const event = db.prepare(`
        SELECT *
        FROM events
        WHERE id = ?
    `).get(result.lastInsertRowid);


  res.status(201).json(event);
});


 /* ============================================================
    候補イベント更新
    ============================================================ */

router.put("/events/:id", (req, res) => {

    const id =
        Number(req.params.id);


    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid event id"
        });
    }


    const existingEvent = db.prepare(`
        SELECT *
        FROM events
        WHERE id = ?
    `).get(id);


    if (!existingEvent) {
        return res.status(404).json({
            error: "Event not found"
        });
    }


    const title =
        normalizeString(req.body.title);


    if (!title) {
        return res.status(400).json({
            error: "イベント名は必須です"
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


    const address =
        normalizeString(req.body.address);


    const externalUrl =
        normalizeString(req.body.external_url);


    const memo =
        normalizeString(req.body.memo);


    const priority =
        req.body.priority === "high"
            ? "high"
            : "normal";


    const visited =
        req.body.visited ? 1 : 0;


    db.prepare(`
        UPDATE events
        SET
            title = ?,
            type = ?,
            start_at = ?,
            end_at = ?,
            location_name = ?,
            address = ?,
            external_url = ?,
            memo = ?,
            priority = ?,
            visited = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        title,
        type,
        startAt,
        endAt,
        locationName,
        address,
        externalUrl,
        memo,
        priority,
        visited,
        id
    );


    const event = db.prepare(`
        SELECT *
        FROM events
        WHERE id = ?
    `).get(id);


    res.json(event);
});


 /* ============================================================
    候補イベント削除
    ============================================================ */

router.delete("/events/:id", (req, res) => {

    const id =
        Number(req.params.id);


    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid event id"
        });
    }


    const result = db.prepare(`
        DELETE FROM events
        WHERE id = ?
    `).run(id);


    if (result.changes === 0) {
        return res.status(404).json({
            error: "Event not found"
        });
    }


    res.status(204).end();
});


module.exports = router;