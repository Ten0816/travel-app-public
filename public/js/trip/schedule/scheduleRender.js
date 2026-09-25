import {
    scheduleList
} from "../../dom.js";

import {
    escapeHtml
} from "../../utils/html.js";


/* ============================================================
   予定一覧を表示
   ============================================================ */

export function renderSchedules(schedules) {

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
            .map(schedule => {

                const status =
                    schedule.status || "planned";


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
            })
            .join("");

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
        new Date(startAt);


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
        new Date(endAt);


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