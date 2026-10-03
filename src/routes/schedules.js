const express = require("express");

const db = require("../db");

const {
    normalizeString
} = require("../utils/normalize");

const {
    findOverlappingSchedule
} = require("../utils/schedule");

const {
    parsePositiveInteger
} = require("../utils/validation");


const router = express.Router();


/* ============================================================
   旅行の予定一覧
   ============================================================ */

router.get("/trips/:id/schedules", (req, res) => {

    const tripId =
        parsePositiveInteger(
            req.params.id
        );


    if (tripId === null) {
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
            CASE
                WHEN start_at IS NULL OR start_at = '' THEN 1
                ELSE 0
            END,
            substr(start_at, 1, 10) ASC,
            sort_order ASC,
            start_at ASC,
            id ASC
    `).all(tripId);


    res.json(schedules);
});


/* ============================================================
   予定 → 候補イベント
   ============================================================ */

router.post(
    "/schedules/:id/move-to-event",
    (req, res) => {

        const scheduleId =
            parsePositiveInteger(
                req.params.id
            );


        if (scheduleId === null) {

            return res.status(400).json({
                error: "Invalid schedule id"
            });

        }


        const schedule =
            db.prepare(`
                SELECT *
                FROM schedules
                WHERE id = ?
            `).get(scheduleId);


        if (!schedule) {

            return res.status(404).json({
                error: "Schedule not found"
            });

        }


        try {

            const move =
                db.transaction(() => {

                    /*
                     * 予定を候補イベントとして作成
                     */

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
                            schedule.trip_id,
                            schedule.title,
                            schedule.type,
                            schedule.start_at,
                            schedule.end_at,
                            schedule.location_name,
                            schedule.address,
                            schedule.latitude,
                            schedule.longitude,
                            schedule.external_url,
                            schedule.description,
                            schedule.priority,
                            0
                        );


                    const event =
                        db.prepare(`
                            SELECT *
                            FROM events
                            WHERE id = ?
                        `).get(
                            result.lastInsertRowid
                        );


                    /*
                     * 元の予定を削除
                     */

                    db.prepare(`
                        DELETE FROM schedules
                        WHERE id = ?
                    `).run(scheduleId);


                    return event;

                })();


            res.json({
                event: move
            });

        } catch (error) {

            console.error(error);


            res.status(500).json({
                error:
                    "予定を候補イベントに移動できませんでした。"
            });

        }

    }
);


/* ============================================================
   予定を作成
   ============================================================ */

router.post("/trips/:id/schedules", (req, res) => {

    const tripId =
        parsePositiveInteger(
            req.params.id
        );


    if (tripId === null) {
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


    const address =
        normalizeString(req.body.address);


    const latitude =
        req.body.latitude ?? null;


    const longitude =
        req.body.longitude ?? null;


    const externalUrl =
        normalizeString(req.body.external_url);


    console.log(
        "schedule external_url:",
        externalUrl
    );


    const priority =
        normalizeString(req.body.priority) ||
        "normal";


    const status =
        normalizeString(req.body.status) ||
        "planned";


    /*
     * 時間重複チェック
     */

    const overlappingSchedule =
        findOverlappingSchedule(
            tripId,
            startAt,
            endAt
        );


    if (overlappingSchedule) {

        return res.status(409).json({
            error:
                `「${overlappingSchedule.title}」と時間が重複しています。`
        });

    }


    const result = db.prepare(`
        INSERT INTO schedules (
            trip_id,
            title,
            start_at,
            end_at,
            type,
            location_name,
            address,
            latitude,
            longitude,
            external_url,
            description,
            priority,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        tripId,
        title,
        startAt,
        endAt,
        type,
        locationName,
        address,
        latitude,
        longitude,
        externalUrl,
        description,
        priority,
        status
    );


    const schedule = db.prepare(`
        SELECT *
        FROM schedules
        WHERE id = ?
    `).get(result.lastInsertRowid);


    res.status(201).json(schedule);
});


/* ============================================================
   予定の実施状態を変更
   ============================================================ */

router.patch(
    "/schedules/:id/status",
    (req, res) => {

        const id =
            parsePositiveInteger(
                req.params.id
            );


        if (id === null) {

            return res.status(400).json({
                error: "Invalid schedule id"
            });

        }


        const existingSchedule =
            db.prepare(`
                SELECT *
                FROM schedules
                WHERE id = ?
            `).get(id);


        if (!existingSchedule) {

            return res.status(404).json({
                error: "Schedule not found"
            });

        }


        const status =
            normalizeString(
                req.body.status
            );


        if (
            status !== "planned" &&
            status !== "completed" &&
            status !== "cancelled"
        ) {

            return res.status(400).json({
                error: "Invalid status"
            });

        }


        db.prepare(`
            UPDATE schedules
            SET
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            status,
            id
        );


        const schedule =
            db.prepare(`
                SELECT *
                FROM schedules
                WHERE id = ?
            `).get(id);


        res.json(schedule);

    }
);


/* ============================================================
   予定の並び順を一括変更
   ============================================================ */

router.patch(
    "/schedules/order",
    (req, res) => {

        const orders =
            req.body.orders;


        /*
         * 配列であることを確認
         */

        if (
            !Array.isArray(orders) ||
            orders.length === 0
        ) {

            return res.status(400).json({
                error: "Invalid orders"
            });

        }


        /*
         * 各要素を検証
         */

        for (const order of orders) {

            if (
                !order ||
                !Number.isInteger(
                    Number(order.id)
                ) ||
                Number(order.id) <= 0 ||
                !Number.isInteger(
                    Number(order.sort_order)
                ) ||
                Number(order.sort_order) < 0
            ) {

                return res.status(400).json({
                    error: "Invalid schedule order"
                });

            }

        }


        /*
         * IDの重複を確認
         */

        const ids =
            orders.map(
                order =>
                    Number(order.id)
            );


        const uniqueIds =
            new Set(
                ids
            );


        if (
            uniqueIds.size !==
            ids.length
        ) {

            return res.status(400).json({
                error: "Duplicate schedule id"
            });

        }


        try {

            const updateOrders =
                db.transaction(() => {

                    const update =
                        db.prepare(`
                            UPDATE schedules
                            SET
                                sort_order = ?,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `);


                    for (
                        const order of orders
                    ) {

                        const result =
                            update.run(
                                Number(
                                    order.sort_order
                                ),
                                Number(
                                    order.id
                                )
                            );


                        /*
                         * 存在しない予定IDが
                         * 含まれていた場合は
                         * トランザクション全体を失敗させる
                         */

                        if (
                            result.changes === 0
                        ) {

                            throw new Error(
                                "Schedule not found"
                            );

                        }

                    }


                    /*
                     * 更新後の予定を取得
                     */

                    const placeholders =
                        ids
                            .map(
                                () => "?"
                            )
                            .join(",");


                    return db.prepare(`
                        SELECT *
                        FROM schedules
                        WHERE id IN (${placeholders})
                    `).all(
                        ...ids
                    );

                })();


            res.json({
                schedules:
                    updateOrders
            });

        } catch (error) {

            console.error(
                "schedule order update error:",
                error
            );


            if (
                error.message ===
                "Schedule not found"
            ) {

                return res.status(404).json({
                    error:
                        "Schedule not found"
                });

            }


            res.status(500).json({
                error:
                    "予定の並び順を変更できませんでした。"
            });

        }

    }
);


/* ============================================================
   予定を更新
   ============================================================ */

router.put("/schedules/:id", (req, res) => {

    const id =
        parsePositiveInteger(
            req.params.id
        );


    if (id === null) {

        return res.status(400).json({
            error: "Invalid schedule id"
        });

    }


    const existingSchedule =
        db.prepare(`
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
        normalizeString(
            req.body.title
        );


    if (!title) {

        return res.status(400).json({
            error: "予定名は必須です"
        });

    }


    const startAt =
        normalizeString(
            req.body.start_at
        );


    const endAt =
        normalizeString(
            req.body.end_at
        );


    const type =
        normalizeString(
            req.body.type
        ) ||
        "other";


    const locationName =
        normalizeString(
            req.body.location_name
        );


    const description =
        normalizeString(
            req.body.description
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


    const priority =
        normalizeString(
            req.body.priority
        ) ||
        "normal";


    const status =
        normalizeString(
            req.body.status
        ) ||
        "planned";


    /*
     * 時間重複チェック
     *
     * 自分自身は除外する
     */

    const overlappingSchedule =
        findOverlappingSchedule(
            existingSchedule.trip_id,
            startAt,
            endAt,
            id
        );


    if (overlappingSchedule) {

        return res.status(409).json({
            error:
                `「${overlappingSchedule.title}」と時間が重複しています。`
        });

    }


    /*
     * 元の予定の日付
     */

    const oldDate =
        getScheduleDateKey(
            existingSchedule.start_at
        );


    /*
     * 更新後の予定の日付
     */

    const newDate =
        getScheduleDateKey(
            startAt
        );


    /*
     * 日付が変わったか
     */

    const dateChanged =
        oldDate !== newDate;


    try {

        const updatedSchedule =
            db.transaction(() => {

                /*
                 * 日付が変わる場合
                 *
                 * 元の日付から予定を外すため、
                 * まず通常のUPDATEを行う。
                 */

                db.prepare(`
                    UPDATE schedules
                    SET
                        title = ?,
                        start_at = ?,
                        end_at = ?,
                        type = ?,
                        location_name = ?,
                        address = ?,
                        latitude = ?,
                        longitude = ?,
                        external_url = ?,
                        description = ?,
                        priority = ?,
                        status = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(
                    title,
                    startAt,
                    endAt,
                    type,
                    locationName,
                    address,
                    latitude,
                    longitude,
                    externalUrl,
                    description,
                    priority,
                    status,
                    id
                );


                /*
                 * 日付が変わった場合
                 */

                if (dateChanged) {

                    /*
                     * 移動先の日付にある予定数を取得
                     *
                     * 現在更新した予定自身は
                     * まだ元のsort_orderを持っているため、
                     * 移動先の予定数だけ取得する。
                     */

                    const lastSchedule =
                        db.prepare(`
                            SELECT sort_order
                            FROM schedules
                            WHERE
                                trip_id = ?
                                AND id != ?
                                AND (
                                    CASE
                                        WHEN start_at IS NULL
                                            OR start_at = ''
                                        THEN 'unknown'
                                        ELSE substr(start_at, 1, 10)
                                    END
                                ) = ?
                            ORDER BY
                                sort_order DESC,
                                start_at DESC,
                                id DESC
                            LIMIT 1
                        `).get(
                            existingSchedule.trip_id,
                            id,
                            newDate
                        );


                    const newSortOrder =
                        lastSchedule
                            ? Number(
                                lastSchedule.sort_order
                            ) + 1
                            : 0;


                    /*
                     * 移動先の日付の末尾へ
                     */

                    db.prepare(`
                        UPDATE schedules
                        SET
                            sort_order = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(
                        newSortOrder,
                        id
                    );


                    /*
                     * 元の日付側のsort_orderを詰め直す
                     */

                    const oldDateSchedules =
                        db.prepare(`
                            SELECT id
                            FROM schedules
                            WHERE
                                trip_id = ?
                                AND id != ?
                                AND (
                                    CASE
                                        WHEN start_at IS NULL
                                            OR start_at = ''
                                        THEN 'unknown'
                                        ELSE substr(start_at, 1, 10)
                                    END
                                ) = ?
                            ORDER BY
                                sort_order ASC,
                                start_at ASC,
                                id ASC
                        `).all(
                            existingSchedule.trip_id,
                            id,
                            oldDate
                        );


                    const updateSortOrder =
                        db.prepare(`
                            UPDATE schedules
                            SET
                                sort_order = ?,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `);


                    oldDateSchedules.forEach(
                        (
                            schedule,
                            index
                        ) => {

                            updateSortOrder.run(
                                index,
                                schedule.id
                            );

                        }
                    );

                }


                /*
                 * 更新後の最新データを取得
                 */

                return db.prepare(`
                    SELECT *
                    FROM schedules
                    WHERE id = ?
                `).get(id);

            })();


        res.json(
            updatedSchedule
        );

    } catch (error) {

        console.error(
            "schedule update error:",
            error
        );


        res.status(500).json({
            error:
                "予定を更新できませんでした。"
        });

    }

});


/* ============================================================
   予定の日付キー
   ============================================================ */

function getScheduleDateKey(
    startAt
) {

    if (!startAt) {

        return "unknown";

    }


    const date =
        new Date(
            startAt
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "unknown";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ============================================================
   予定を削除
   ============================================================ */

router.delete("/schedules/:id", (req, res) => {

    const id =
        parsePositiveInteger(
            req.params.id
        );


    if (id === null) {
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