import {
    eventList,
    createEventButton,
    eventForm
} from "../dom.js";

import {
    escapeHtml
} from "../utils/html.js";

import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
} from "../api/events.js";

import {
    getCurrentTrip
} from "../state.js";

import {
    showAlert,
    showConfirm
} from "../modal/modal.js";

import {
    openEventModal,
    openEventEditModal,
    getEventFormData,
    closeEventModal
} from "../modal/eventModal.js";

import {
    openScheduleModal
} from "../modal/scheduleModal.js";


let editingEventId = null;


/* ============================================================
   候補イベント一覧を表示
   ============================================================ */

export function renderEvents(events) {

    if (events.length === 0) {

        eventList.innerHTML = `
            <p class="section-description">
                候補イベントはまだありません。
            </p>
        `;

        return;
    }


    eventList.innerHTML =
        events
            .map(event => `

                <div
                    class="event-card"
                    data-event-id="${event.id}"
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

            `)
            .join("");

}


eventList.addEventListener(
    "click",
    async event => {

        const addScheduleButton =
            event.target.closest(
                ".event-add-schedule-button"
            );

        const editButton =
            event.target.closest(
                ".event-edit-button"
            );

        const deleteButton =
            event.target.closest(
                ".event-delete-button"
            );

        if (
            !addScheduleButton &&
            !editButton &&
            !deleteButton
        ) {
            return;
        }

        const button =
            addScheduleButton ||
            editButton ||
            deleteButton;

        const eventId =
            Number(
                button.dataset.eventId
            );

        const trip =
            getCurrentTrip();

        if (!trip) {
            return;
        }


        if (addScheduleButton) {

            try {

                const events =
                    await getEvents(
                        trip.id
                    );

                const targetEvent =
                    events.find(
                        item =>
                            item.id === eventId
                    );

                if (!targetEvent) {
                    return;
                }

                openScheduleModal({
                    title:
                        targetEvent.title,

                    type:
                        targetEvent.type,

                    start_at:
                        targetEvent.start_at,

                    end_at:
                        targetEvent.end_at,

                    location_name:
                        targetEvent.location_name,

                    address:
                        targetEvent.address,

                    latitude:
                        targetEvent.latitude,

                    longitude:
                        targetEvent.longitude,

                    external_url:
                        targetEvent.external_url,

                    priority:
                        targetEvent.priority,

                    description:
                        targetEvent.memo
                });

            } catch (error) {

                console.error(error);

                await showAlert(
                    "候補イベントを取得できませんでした。"
                );

            }

            return;
        }


        // ========================================================
        // 編集
        // ========================================================

        if (editButton) {

            try {

                const events =
                    await getEvents(trip.id);

                const targetEvent =
                    events.find(
                        item =>
                            item.id === eventId
                    );

                if (!targetEvent) {
                    return;
                }

                editingEventId =
                    targetEvent.id;

                openEventEditModal(
                    targetEvent
                );

            } catch (error) {

                console.error(error);

                await showAlert(
                    "候補イベントを取得できませんでした。"
                );

            }

            return;
        }


        // ========================================================
        // 削除確認
        // ========================================================

        if (deleteButton) {

            const confirmed =
                await showConfirm(
                    "この候補イベントを削除しますか？"
                );

            if (!confirmed) {
                return;
            }

            try {

                await deleteEvent(
                    eventId
                );

                await reloadEvents();

            } catch (error) {

                console.error(error);

                await showAlert(
                    error.message ||
                    "候補イベントの削除に失敗しました。"
                );

            }
        }

    }
);


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
        new Date(startAt);

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

    return `${startText} ～ ${endText}`;
}


/* ============================================================
   候補イベント一覧を再読み込み
   ============================================================ */

export async function reloadEvents() {

    const currentTrip =
        getCurrentTrip();

    if (!currentTrip) {
        return;
    }

    const events =
        await getEvents(
            currentTrip.id
        );

    renderEvents(
        events
    );
}


export async function loadEvents(
    tripId
) {

    const events =
        await getEvents(
            tripId
        );

    renderEvents(
        events
    );
}


/* ============================================================
   候補イベント追加
   ============================================================ */

createEventButton.addEventListener(
    "click",
    () => {

        editingEventId = null;

        openEventModal();
    }
);


/* ============================================================
   候補イベントフォーム送信
   ============================================================ */

eventForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const trip =
            getCurrentTrip();

        if (!trip) {
            return;
        }

        try {

            const data =
                getEventFormData();

            if (editingEventId !== null) {

                await updateEvent(
                    editingEventId,
                    data
                );

            } else {

                await createEvent(
                    trip.id,
                    data
                );

            }

            editingEventId = null;

            closeEventModal();

            await reloadEvents();

        } catch (error) {

            console.error(error);

            await showAlert(
                error.message ||
                "候補イベントの保存に失敗しました。"
            );

        }

    }
);