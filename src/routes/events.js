const express = require("express");

const db = require("../db");

const {
    normalizeString
} = require("../utils/normalize");


const router =
    express.Router();


/* ============================================================
   旅行の候補イベント一覧
   ============================================================ */

router.get(
    "/trips/:id/events",
    (req, res) => {

        const tripId =
            Number(req.params.id);


        if (
            !Number.isInteger(tripId) ||
            tripId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid trip id"
            });

        }


        const trip =
            db.prepare(`
                SELECT id
                FROM trips
                WHERE id = ?
            `).get(tripId);


        if (!trip) {

            return res.status(404).json({
                error: "Trip not found"
            });

        }


        const events =
            db.prepare(`
                SELECT *
                FROM events
                WHERE trip_id = ?
                ORDER BY
                    visited ASC,
                    CASE
                        WHEN start_at IS NULL
                        THEN 1
                        ELSE 0
                    END ASC,
                    start_at ASC,
                    id ASC
            `).all(tripId);


        res.json(events);

    }
);


/* ============================================================
   候補イベント作成
   ============================================================ */

router.post(
    "/trips/:id/events",
    (req, res) => {

        const tripId =
            Number(req.params.id);


        if (
            !Number.isInteger(tripId) ||
            tripId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid trip id"
            });

        }


        const trip =
            db.prepare(`
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
            normalizeString(
                req.body.title
            );


        if (!title) {

            return res.status(400).json({
                error: "候補イベント名は必須です"
            });

        }


        const type =
            normalizeString(
                req.body.type
            ) || "other";


        const startAt =
            normalizeString(
                req.body.start_at
            );


        const endAt =
            normalizeString(
                req.body.end_at
            );


        const locationName =
            normalizeString(
                req.body.location_name
            );


        const address =
            normalizeString(
                req.body.address
            );


        const latitude =
            req.body.latitude ??
            null;


        const longitude =
            req.body.longitude ??
            null;


        const externalUrl =
            normalizeString(
                req.body.external_url
            );


        const memo =
            normalizeString(
                req.body.memo
            );


        const priority =
            req.body.priority === "high"
                ? "high"
                : "normal";


        const visited =
            req.body.visited
                ? 1
                : 0;


        const result =
            db.prepare(`
                INSERT INTO events (
                    trip_id,
                    title,
                    type,
                    start_at,
                    end_at,
                    location_name,
                    address,
                    latitude,
                    longitude,
                    external_url,
                    memo,
                    priority,
                    visited
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
            `).run(
                tripId,
                title,
                type,
                startAt,
                endAt,
                locationName,
                address,
                latitude,
                longitude,
                externalUrl,
                memo,
                priority,
                visited
            );


        const event =
            db.prepare(`
                SELECT *
                FROM events
                WHERE id = ?
            `).get(
                result.lastInsertRowid
            );


        res.status(201).json(event);

    }
);


/* ============================================================
   候補イベント更新
   ============================================================ */

router.put(
    "/events/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                error: "Invalid event id"
            });

        }


        const existingEvent =
            db.prepare(`
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
            normalizeString(
                req.body.title
            );


        if (!title) {

            return res.status(400).json({
                error: "候補イベント名は必須です"
            });

        }


        const type =
            normalizeString(
                req.body.type
            ) || "other";


        const startAt =
            normalizeString(
                req.body.start_at
            );


        const endAt =
            normalizeString(
                req.body.end_at
            );


        const locationName =
            normalizeString(
                req.body.location_name
            );


        const address =
            normalizeString(
                req.body.address
            );


        const latitude =
            req.body.latitude ??
            null;


        const longitude =
            req.body.longitude ??
            null;


        const externalUrl =
            normalizeString(
                req.body.external_url
            );


        const memo =
            normalizeString(
                req.body.memo
            );


        const priority =
            req.body.priority === "high"
                ? "high"
                : "normal";


        db.prepare(`
            UPDATE events
            SET
                title = ?,
                type = ?,
                start_at = ?,
                end_at = ?,
                location_name = ?,
                address = ?,
                latitude = ?,
                longitude = ?,
                external_url = ?,
                memo = ?,
                priority = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            title,
            type,
            startAt,
            endAt,
            locationName,
            address,
            latitude,
            longitude,
            externalUrl,
            memo,
            priority,
            id
        );


        const event =
            db.prepare(`
                SELECT *
                FROM events
                WHERE id = ?
            `).get(id);


        res.json(event);

    }
);


/* ============================================================
   候補イベントの訪問済み状態変更
   ============================================================ */

router.patch(
    "/events/:id/visited",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                error: "Invalid event id"
            });

        }


        const existingEvent =
            db.prepare(`
                SELECT *
                FROM events
                WHERE id = ?
            `).get(id);


        if (!existingEvent) {

            return res.status(404).json({
                error: "Event not found"
            });

        }


        const visited =
            req.body.visited
                ? 1
                : 0;


        db.prepare(`
            UPDATE events
            SET
                visited = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            visited,
            id
        );


        const event =
            db.prepare(`
                SELECT *
                FROM events
                WHERE id = ?
            `).get(id);


        res.json(event);

    }
);


/* ============================================================
   候補イベント削除
   ============================================================ */

router.delete(
    "/events/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                error: "Invalid event id"
            });

        }


        const result =
            db.prepare(`
                DELETE FROM events
                WHERE id = ?
            `).run(id);


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Event not found"
            });

        }


        res.json({
            success: true
        });

    }
);


module.exports = router;