import {
    escapeHtml
} from "../utils/html.js";


/* ============================================================
   候補イベントカード生成
   ============================================================ */

export function createEventCard(
    event
) {

    return `

        <div
            class="event-card"
            data-event-id="${event.id}"
            data-visited="${event.visited ? "1" : "0"}"
            data-start-at="${escapeHtml(
                event.start_at || ""
            )}"
        >

            <div class="event-content">

                <h4 class="event-title">

                    ${escapeHtml(
                        event.title
                    )}

                </h4>


                ${event.location_name
                    ? `
                <p class="event-location">

                    ${escapeHtml(
                        event.location_name
                    )}

                </p>
                `
                    : ""
                }


                ${event.address
                    ? `
                <p class="event-address">

                    ${escapeHtml(
                        event.address
                    )}

                </p>
                `
                    : ""
                }


                ${event.start_at
                    ? `
                <p class="event-time">

                    ${formatEventTime(
                        event.start_at,
                        event.end_at
                    )}

                </p>
                `
                    : ""
                }


                ${event.external_url
                    ? `
                <p class="event-url">

                    <a
                        href="${escapeHtml(
                            event.external_url
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


                ${event.priority === "high"
                    ? `
                <p class="event-priority">
                    優先度：高
                </p>
                `
                    : ""
                }


                ${event.memo
                    ? `
                <p class="event-description">

                    ${escapeHtml(
                        event.memo
                    )}

                </p>
                `
                    : ""
                }

            </div>


            <div class="event-actions">

                ${event.address
                    ? `
                <a
                    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        event.address
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="secondary-button"
                >
                    Google Mapsで開く
                </a>
                `
                    : ""
                }

                <button
                    type="button"
                    class="primary-button event-add-schedule-button"
                    data-event-id="${event.id}"
                >
                    予定に追加
                </button>

                <button
                    type="button"
                    class="secondary-button event-edit-button"
                    data-event-id="${event.id}"
                >
                    編集
                </button>

                <button
                    type="button"
                    class="danger-button event-delete-button"
                    data-event-id="${event.id}"
                >
                    削除
                </button>

            </div>

        </div>

    `;
}


/* ============================================================
   候補イベント日時を表示
   ============================================================ */

function formatEventTime(
    startAt,
    endAt
) {

    if (!startAt) {
        return "";
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

        return "";
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


    return `${startText} ～ ${endText}`;

}