import {
    scheduleList
} from "../../dom.js";

import {
    escapeHtml
} from "../../utils/html.js";


/* ============================================================
   現在表示している予定
   ============================================================ */

const scheduleMap =
    new Map();


/* ============================================================
   予定一覧を表示
   ============================================================ */

export function renderSchedules(
    schedules
) {

    scheduleMap.clear();


    schedules.forEach(
        schedule => {

            scheduleMap.set(
                schedule.id,
                schedule
            );

        }
    );


    if (schedules.length === 0) {

        scheduleList.innerHTML = `
            <p class="section-description">
                予定はまだありません。
            </p>
        `;

        return;
    }


    /*
     * 日付ごとにグループ化
     */
    const groups =
        groupSchedulesByDate(
            schedules
        );


    scheduleList.innerHTML =
        groups
            .map(
                group =>
                    createScheduleGroup(
                        group
                    )
            )
            .join("");

}


/* ============================================================
   日付ごとに予定をグループ化
   ============================================================ */

function groupSchedulesByDate(
    schedules
) {

    const groupMap =
        new Map();


    schedules.forEach(
        schedule => {

            const dateKey =
                getScheduleDateKey(
                    schedule.start_at
                );


            if (
                !groupMap.has(
                    dateKey
                )
            ) {

                groupMap.set(
                    dateKey,
                    []
                );

            }


            groupMap
                .get(dateKey)
                .push(schedule);

        }
    );


    const groups =
        Array.from(
            groupMap.entries()
        )
            .map(
                ([dateKey, groupSchedules]) => {

                    groupSchedules.sort(
                        (
                            a,
                            b
                        ) =>
                            compareSortKeys(
                                getScheduleSortKey(
                                    a.start_at,
                                    a.id
                                ),
                                getScheduleSortKey(
                                    b.start_at,
                                    b.id
                                )
                            )
                    );


                    return {
                        dateKey,
                        schedules:
                            groupSchedules
                    };

                }
            );


    /*
     * 日付順
     *
     * 日時未定は最後
     */
    groups.sort(
        (a, b) => {

            if (
                a.dateKey ===
                "unknown"
            ) {

                return 1;

            }


            if (
                b.dateKey ===
                "unknown"
            ) {

                return -1;

            }


            return a.dateKey
                .localeCompare(
                    b.dateKey
                );

        }
    );


    return groups;

}


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
   日付グループ生成
   ============================================================ */

function createScheduleGroup(
    group
) {

    const title =
        group.dateKey === "unknown"
            ? "日時未定"
            : formatScheduleDate(
                group.dateKey
            );


    return `

        <section
            class="schedule-day-group"
            data-date="${escapeHtml(
                group.dateKey
            )}"
        >

            <h3 class="schedule-day-title">

                ${escapeHtml(
                    title
                )}

            </h3>


            <div class="schedule-day-list">

                ${group.schedules
                    .map(
                        schedule =>
                            createScheduleCard(
                                schedule
                            )
                    )
                    .join("")}

            </div>

        </section>

    `;

}


/* ============================================================
   日付表示
   ============================================================ */

function formatScheduleDate(
    dateKey
) {

    const [
        year,
        month,
        day
    ] =
        dateKey
            .split("-")
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateKey;

    }


    const weekday =
        date.toLocaleDateString(
            "ja-JP",
            {
                weekday: "short"
            }
        );


    return `${month}月${day}日（${weekday.replace(
        "曜日",
        ""
    )}）`;

}


/* ============================================================
   IDから予定を取得
   ============================================================ */

export function getScheduleById(
    scheduleId
) {

    return scheduleMap.get(
        scheduleId
    );

}


/* ============================================================
   予定カード生成
   ============================================================ */

function createScheduleCard(
    schedule
) {

    const status =
        schedule.status ||
        "planned";


    const statusText =
        status === "completed"
            ? "実施済み"
            : status === "cancelled"
                ? "キャンセル"
                : "予定中";


    /*
     * 実施状態切り替えボタン
     *
     * キャンセルの場合は表示しない。
     * キャンセル解除は編集画面から行う。
     */
    const statusToggleButton =
        status === "cancelled"
            ? ""
            : `
                <button
                    type="button"
                    class="secondary-button schedule-status-toggle-button"
                    data-schedule-id="${schedule.id}"
                >
                    ${
                        status === "completed"
                            ? "予定に戻す"
                            : "実施済みにする"
                    }
                </button>
            `;


    return `

        <div
            class="schedule-card"
            data-schedule-id="${schedule.id}"
            data-start-at="${escapeHtml(
                schedule.start_at || ""
            )}"
        >

            <div class="schedule-time">

                ${formatScheduleTime(
                    schedule.start_at,
                    schedule.end_at
                )}

            </div>


            <div class="schedule-content">

                <h4 class="schedule-title">

                    ${escapeHtml(
                        schedule.title
                    )}

                </h4>


                <p class="schedule-status">

                    状態：${statusText}

                </p>


                ${schedule.location_name
                    ? `
                <p class="schedule-location">

                    ${escapeHtml(
                        schedule.location_name
                    )}

                </p>
                `
                    : ""
                }


                ${schedule.address
                    ? `
                <p class="schedule-address">

                    ${escapeHtml(
                        schedule.address
                    )}

                </p>
                `
                    : ""
                }


                ${schedule.external_url
                    ? `
                <p class="schedule-url">

                    <a
                        href="${escapeHtml(
                            schedule.external_url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        公式サイト・詳細を見る
                    </a>

                </p>
                `
                    : ""
                }


                ${schedule.priority === "high"
                    ? `
                <p class="schedule-priority">
                    優先度：高
                </p>
                `
                    : ""
                }


                ${schedule.description
                    ? `
                <p class="schedule-description">

                    ${escapeHtml(
                        schedule.description
                    )}

                </p>
                `
                    : ""
                }

            </div>


            <div class="schedule-actions">

                ${statusToggleButton}


                <button
                    type="button"
                    class="secondary-button schedule-return-event-button"
                    data-schedule-id="${schedule.id}"
                >
                    候補に戻す
                </button>


                <button
                    type="button"
                    class="secondary-button schedule-edit-button"
                    data-schedule-id="${schedule.id}"
                >
                    編集
                </button>


                <button
                    type="button"
                    class="danger-button schedule-delete-button"
                    data-schedule-id="${schedule.id}"
                >
                    削除
                </button>

            </div>

        </div>

    `;

}


/* ============================================================
   予定を一覧に追加
   ============================================================ */

export function addScheduleToList(
    schedule
) {

    scheduleMap.set(
        schedule.id,
        schedule
    );


    /*
     * 現在のローカル状態だけで再描画
     *
     * APIへの追加通信は発生しない
     */
    renderSchedules(
        Array.from(
            scheduleMap.values()
        )
    );

}


/* ============================================================
   予定を一覧から削除
   ============================================================ */

export function removeScheduleFromList(
    scheduleId
) {

    scheduleMap.delete(
        scheduleId
    );


    if (
        scheduleMap.size === 0
    ) {

        scheduleList.innerHTML = `
            <p class="section-description">
                予定はまだありません。
            </p>
        `;

        return;

    }


    /*
     * 現在のローカル状態だけで再描画
     */
    renderSchedules(
        Array.from(
            scheduleMap.values()
        )
    );

}


/* ============================================================
   予定のソートキー
   ============================================================ */

function getScheduleSortKey(
    startAt,
    id
) {

    if (!startAt) {

        return {
            hasTime: false,
            time: Number.MAX_SAFE_INTEGER,
            id
        };

    }


    const time =
        new Date(
            startAt
        ).getTime();


    if (
        Number.isNaN(
            time
        )
    ) {

        return {
            hasTime: false,
            time: Number.MAX_SAFE_INTEGER,
            id
        };

    }


    return {
        hasTime: true,
        time,
        id
    };

}


/* ============================================================
   ソートキー比較
   ============================================================ */

function compareSortKeys(
    a,
    b
) {

    /*
     * 日時あり → 日時なし
     */
    if (
        a.hasTime !==
        b.hasTime
    ) {

        return a.hasTime
            ? -1
            : 1;

    }


    /*
     * 日時あり同士
     */
    if (a.hasTime) {

        if (
            a.time !==
            b.time
        ) {

            return a.time -
                b.time;

        }

    }


    /*
     * 日時が同じならID昇順
     */
    return a.id -
        b.id;

}


/* ============================================================
   予定日時を表示
   ============================================================ */

function formatScheduleTime(
    startAt,
    endAt
) {

    if (!startAt) {
        return "時間未定";
    }


    const startDate =
        new Date(
            startAt
        );


    if (
        Number.isNaN(
            startDate.getTime()
        )
    ) {

        return "時間未定";

    }


    const startTimeText =
        startDate.toLocaleTimeString(
            "ja-JP",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    if (!endAt) {
        return startTimeText;
    }


    const endDate =
        new Date(
            endAt
        );


    if (
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        return startTimeText;

    }


    const endTimeText =
        endDate.toLocaleTimeString(
            "ja-JP",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    /*
     * 日付が同じ場合
     *
     * 例：
     * 10:00 ～ 12:00
     */
    const sameDate =
        startDate.getFullYear() ===
            endDate.getFullYear() &&
        startDate.getMonth() ===
            endDate.getMonth() &&
        startDate.getDate() ===
            endDate.getDate();


    if (sameDate) {

        return `

            <span class="schedule-time-start">
                ${startTimeText}
            </span>

            <span class="schedule-time-separator">
                ～
            </span>

            <span class="schedule-time-end">
                ${endTimeText}
            </span>

        `;

    }


    /*
     * 日付をまたぐ場合
     *
     * 例：
     * 9月27日 22:00 ～ 9月28日 02:00
     */
    const endDateText =
        endDate.toLocaleDateString(
            "ja-JP",
            {
                month: "numeric",
                day: "numeric"
            }
        );


    return `

        <span class="schedule-time-start">
            ${startTimeText}
        </span>

        <span class="schedule-time-separator">
            ～
        </span>

        <span class="schedule-time-end">
            ${endDateText} ${endTimeText}
        </span>

    `;

}