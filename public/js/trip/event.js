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

                        ${event.start_at
                    ? `
                                    <p class="event-time">
                                        ${formatEventTime(
                        event.start_at
                    )}
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

        const editButton =
            event.target.closest(
                ".event-edit-button"
            );

        const deleteButton =
            event.target.closest(
                ".event-delete-button"
            );

        if (!editButton && !deleteButton) {
            return;
        }

        const button =
            editButton || deleteButton;

        const eventId =
            Number(
                button.dataset.eventId
            );

        const trip =
            getCurrentTrip();

        if (!trip) {
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

function formatEventTime(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleString(
        "ja-JP",
        {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

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