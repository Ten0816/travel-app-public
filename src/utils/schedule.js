const db = require("../db");


/* ============================================================
   予定の時間重複チェック
   ============================================================ */

function findOverlappingSchedule(
    tripId,
    startAt,
    endAt,
    excludeId = null
) {

    console.log(
        "[findOverlappingSchedule]",
        {
            tripId,
            startAt,
            endAt,
            excludeId
        }
    );


    if (!startAt || !endAt) {

        console.log(
            "[findOverlappingSchedule] 日時不足"
        );

        return null;
    }


    const overlappingSchedule =
        db.prepare(`
            SELECT *
            FROM schedules
            WHERE
                trip_id = ?
                AND start_at IS NOT NULL
                AND start_at != ''
                AND end_at IS NOT NULL
                AND end_at != ''
                AND start_at < ?
                AND end_at > ?
                AND (
                    ? IS NULL
                    OR id != ?
                )
            ORDER BY
                start_at ASC,
                id ASC
            LIMIT 1
        `).get(
            tripId,
            endAt,
            startAt,
            excludeId,
            excludeId
        );


    console.log(
        "[findOverlappingSchedule] 結果",
        overlappingSchedule
    );


    return overlappingSchedule || null;
}


module.exports = {
    findOverlappingSchedule
};