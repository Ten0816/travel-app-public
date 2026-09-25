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

    /*
     * 現在の予定情報を更新
     */
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


    scheduleList.innerHTML =
        schedules
            .map(
                schedule =>
                    createScheduleCard(
                        schedule
                    )
            )
            .join("");

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

    /*
     * ローカル状態を更新
     */
    scheduleMap.set(
        schedule.id,
        schedule
    );


    /*
     * 空表示を削除
     */
    const emptyMessage =
        scheduleList.querySelector(
            ".section-description"
        );


    if (emptyMessage) {
        emptyMessage.remove();
    }


    /*
     * 同じ予定が存在する場合は置き換える
     */
    const existingCard =
        scheduleList.querySelector(
            `.schedule-card[data-schedule-id="${schedule.id}"]`
        );


    if (existingCard) {

        existingCard.outerHTML =
            createScheduleCard(
                schedule
            );

        return;

    }


    const newCardHtml =
        createScheduleCard(
            schedule
        );


    const newSortKey =
        getScheduleSortKey(
            schedule.start_at,
            schedule.id
        );


    const cards =
        Array.from(
            scheduleList.querySelectorAll(
                ".schedule-card"
            )
        );


    /*
     * 新しい予定より後ろに来る
     * 最初のカードを探す
     */
    const insertBefore =
        cards.find(
            card => {

                const cardStartAt =
                    card.dataset.startAt ||
                    null;


                const cardId =
                    Number(
                        card.dataset.scheduleId
                    );


                const cardSortKey =
                    getScheduleSortKey(
                        cardStartAt,
                        cardId
                    );


                return compareSortKeys(
                    newSortKey,
                    cardSortKey
                ) < 0;

            }
        );


    if (insertBefore) {

        insertBefore.insertAdjacentHTML(
            "beforebegin",
            newCardHtml
        );

    } else {

        scheduleList.insertAdjacentHTML(
            "beforeend",
            newCardHtml
        );

    }

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
   予定を一覧から削除
   ============================================================ */

export function removeScheduleFromList(
    scheduleId
) {

    scheduleMap.delete(
        scheduleId
    );


    const card =
        scheduleList.querySelector(
            `.schedule-card[data-schedule-id="${scheduleId}"]`
        );


    if (card) {
        card.remove();
    }


    if (
        scheduleList.querySelector(
            ".schedule-card"
        ) === null
    ) {

        scheduleList.innerHTML = `
            <p class="section-description">
                予定はまだありません。
            </p>
        `;

    }

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


    const startText =
        startDate.toLocaleString(
            "ja-JP",
            {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    if (!endAt) {
        return startText;
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

        return startText;

    }


    const endText =
        endDate.toLocaleString(
            "ja-JP",
            {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    return `

        <span class="schedule-time-start">
            ${startText}
        </span>

        <span class="schedule-time-separator">
            ～
        </span>

        <span class="schedule-time-end">
            ${endText}
        </span>

    `;

}