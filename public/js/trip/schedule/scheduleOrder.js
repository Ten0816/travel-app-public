import {
    getScheduleById,
    getSchedulesFromList
} from "./scheduleRender.js";

import {
    updateScheduleOrders
} from "../../api/schedules.js";

import {
    getDateKey
} from "../../utils/date.js";


/* ============================================================
   予定を上下に移動
   ============================================================ */

export async function moveSchedule(
    scheduleId,
    direction
) {

    const schedule =
        getScheduleById(
            scheduleId
        );


    if (!schedule) {

        throw new Error(
            "予定が見つかりません。"
        );

    }


    const schedules =
        getSchedulesFromList();


    /*
     * 現在の予定と同じ日付の予定だけを取得
     */
    const currentDate =
        getDateKey(
            schedule.start_at
        ) || "unknown";


    const sameDaySchedules =
        schedules
            .filter(
                item =>
                    (
                        getDateKey(
                            item.start_at
                        ) || "unknown"
                    ) === currentDate
            )
            .sort(
                compareScheduleOrder
            );


    const currentIndex =
        sameDaySchedules.findIndex(
            item =>
                item.id === scheduleId
        );


    if (
        currentIndex === -1
    ) {

        return false;

    }


    const targetIndex =
        direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;


    /*
     * 先頭・末尾の場合は移動しない
     */
    if (
        targetIndex < 0 ||
        targetIndex >=
            sameDaySchedules.length
    ) {

        return false;

    }


    /*
     * 配列上で予定を入れ替える
     */
    const reordered =
        [
            ...sameDaySchedules
        ];


    [
        reordered[currentIndex],
        reordered[targetIndex]
    ] = [
        reordered[targetIndex],
        reordered[currentIndex]
    ];


    /*
     * 同じ日付グループの
     * sort_orderを振り直す
     */
    reordered.forEach(
        (
            item,
            index
        ) => {

            item.sort_order =
                index;

        }
    );


    /*
     * 同じ日付グループの
     * 並び順を一括保存
     *
     * これにより、
     * 予定1件につき複数回PATCHする必要がなくなる。
     */
    await updateScheduleOrders(
        reordered.map(
            item => ({
                id:
                    item.id,

                sort_order:
                    item.sort_order
            })
        )
    );


    return true;

}


/* ============================================================
   予定の並び順を比較
   ============================================================ */

function compareScheduleOrder(
    a,
    b
) {

    const aOrder =
        Number(
            a.sort_order
        );


    const bOrder =
        Number(
            b.sort_order
        );


    const normalizedAOrder =
        Number.isInteger(
            aOrder
        )
            ? aOrder
            : Number.MAX_SAFE_INTEGER;


    const normalizedBOrder =
        Number.isInteger(
            bOrder
        )
            ? bOrder
            : Number.MAX_SAFE_INTEGER;


    if (
        normalizedAOrder !==
        normalizedBOrder
    ) {

        return normalizedAOrder -
            normalizedBOrder;

    }


    /*
     * sort_orderが同じ場合は
     * 開始時刻順
     */
    const aTime =
        a.start_at
            ? new Date(
                a.start_at
            ).getTime()
            : Number.MAX_SAFE_INTEGER;


    const bTime =
        b.start_at
            ? new Date(
                b.start_at
            ).getTime()
            : Number.MAX_SAFE_INTEGER;


    const normalizedATime =
        Number.isNaN(aTime)
            ? Number.MAX_SAFE_INTEGER
            : aTime;


    const normalizedBTime =
        Number.isNaN(bTime)
            ? Number.MAX_SAFE_INTEGER
            : bTime;


    if (
        normalizedATime !==
        normalizedBTime
    ) {

        return normalizedATime -
            normalizedBTime;

    }


    /*
     * 時刻も同じ場合はID順
     */
    return a.id -
        b.id;

}