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
   現在表示している候補イベント
   ============================================================ */

const eventMap =
    new Map();


/* ============================================================
   候補イベント一覧を表示
   ============================================================ */

export function renderEvents(
    events
) {

    /*
     * 現在のイベント情報を更新
     */
    eventMap.clear();


    events.forEach(
        event => {

            eventMap.set(
                event.id,
                event
            );

        }
    );


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
            .map(
                event =>
                    createEventCard(
                        event
                    )
            )
            .join("");

}


/* ============================================================
   候補イベントカード生成
   ============================================================ */

function createEventCard(
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
   候補イベントを一覧に追加
   ============================================================ */

export function addEventToList(
    event
) {

    /*
     * ローカル状態を更新
     */
    eventMap.set(
        event.id,
        event
    );


    /*
     * 「候補イベントはまだありません」を削除
     */
    const emptyMessage =
        eventList.querySelector(
            ".section-description"
        );


    if (emptyMessage) {
        emptyMessage.remove();
    }


    /*
     * 同じイベントが既に存在する場合
     */
    const existingCard =
        eventList.querySelector(
            `.event-card[data-event-id="${event.id}"]`
        );


    if (existingCard) {

        existingCard.outerHTML =
            createEventCard(
                event
            );

        return;
    }


    const newCardHtml =
        createEventCard(
            event
        );


    const newSortKey =
        getEventSortKey(
            event
        );


    const cards =
        Array.from(
            eventList.querySelectorAll(
                ".event-card"
            )
        );


    /*
     * サーバー側と同じ並び順になるように
     * 挿入位置を決定
     */
    const insertBefore =
        cards.find(
            card => {

                const cardId =
                    Number(
                        card.dataset.eventId
                    );


                const cardStartAt =
                    card.dataset.startAt ||
                    null;


                const cardVisited =
                    card.dataset.visited === "1";


                const cardSortKey =
                    getEventSortKey({
                        id: cardId,
                        start_at: cardStartAt,
                        visited: cardVisited
                    });


                return compareEventSortKeys(
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

        eventList.insertAdjacentHTML(
            "beforeend",
            newCardHtml
        );

    }

}


/* ============================================================
   イベントのソートキー
   ============================================================ */

function getEventSortKey(
    event
) {

    const visited =
        event.visited
            ? 1
            : 0;


    let time =
        Number.MAX_SAFE_INTEGER;


    if (event.start_at) {

        const parsedTime =
            new Date(
                event.start_at
            ).getTime();


        if (
            !Number.isNaN(
                parsedTime
            )
        ) {

            time =
                parsedTime;

        }

    }


    return {
        visited,
        time,
        id: Number(event.id)
    };

}


/* ============================================================
   イベントのソートキー比較
   ============================================================ */

function compareEventSortKeys(
    a,
    b
) {

    /*
     * 未訪問 → 訪問済み
     */
    if (
        a.visited !==
        b.visited
    ) {

        return a.visited -
            b.visited;

    }


    /*
     * 日時あり → 日時なし
     */
    if (
        a.time !==
        b.time
    ) {

        return a.time -
            b.time;

    }


    /*
     * 最後にID昇順
     */
    return a.id -
        b.id;

}


/* ============================================================
   候補イベントカード操作
   ============================================================ */

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


        /* ========================================================
           予定に追加
           ======================================================== */

        if (addScheduleButton) {

            const targetEvent =
                eventMap.get(
                    eventId
                );


            if (!targetEvent) {

                await showAlert(
                    "候補イベントが見つかりません。"
                );

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
                    targetEvent.memo,

                source_event_id:
                    targetEvent.id

            });


            return;

        }


        /* ========================================================
           編集
           ======================================================== */

        if (editButton) {

            const targetEvent =
                eventMap.get(
                    eventId
                );


            if (!targetEvent) {

                await showAlert(
                    "候補イベントが見つかりません。"
                );

                return;

            }


            editingEventId =
                targetEvent.id;


            openEventEditModal(
                targetEvent
            );


            return;

        }


        /* ========================================================
           削除確認
           ======================================================== */

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


                removeEventFromList(
                    eventId
                );

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


/* ============================================================
   候補イベント初回読み込み
   ============================================================ */

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


            if (
                editingEventId !==
                null
            ) {

                const updatedEvent =
                    await updateEvent(
                        editingEventId,
                        data
                    );


                eventMap.set(
                    updatedEvent.id,
                    updatedEvent
                );


                const card =
                    eventList.querySelector(
                        `.event-card[data-event-id="${updatedEvent.id}"]`
                    );


                if (card) {

                    card.outerHTML =
                        createEventCard(
                            updatedEvent
                        );

                }

            } else {

                const newEvent =
                    await createEvent(
                        trip.id,
                        data
                    );


                addEventToList(
                    newEvent
                );

            }


            editingEventId =
                null;


            closeEventModal();

        } catch (error) {

            console.error(error);


            await showAlert(
                error.message ||
                "候補イベントの保存に失敗しました。"
            );

        }

    }
);


/* ============================================================
   候補イベントを一覧から削除
   外部から使用
   ============================================================ */

export function removeEventFromList(
    eventId
) {

    eventMap.delete(
        eventId
    );


    const card =
        eventList.querySelector(
            `.event-card[data-event-id="${eventId}"]`
        );


    if (card) {
        card.remove();
    }


    if (
        eventList.querySelector(
            ".event-card"
        ) === null
    ) {

        eventList.innerHTML = `
            <p class="section-description">
                候補イベントはまだありません。
            </p>
        `;

    }

}