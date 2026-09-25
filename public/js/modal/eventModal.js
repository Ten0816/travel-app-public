/* ============================================================
   イベントモーダル
   ============================================================ */

import {
    eventModal,
    eventModalTitle,
    closeEventModalButton,
    cancelEventButton,
    eventForm,
    eventTitleInput,
    eventTypeInput,
    eventStartAtInput,
    eventEndAtInput,
    eventLocationInput,
    eventAddressInput,
    eventUrlInput,
    eventMemoInput,
    eventPriorityInput
} from "../dom.js";


/* ============================================================
   イベントモーダルを開く
   ============================================================ */

export function openEventModal() {

    eventModalTitle.textContent =
        "候補イベントを追加";


    eventForm.reset();


    eventModal.dataset.latitude =
        "";

    eventModal.dataset.longitude =
        "";


    eventModal.classList.remove(
        "hidden"
    );

}


/* ============================================================
   イベント編集モーダルを開く
   ============================================================ */

export function openEventEditModal(event) {

    eventModalTitle.textContent =
        "候補イベントを編集";


    eventTitleInput.value =
        event.title || "";

    eventTypeInput.value =
        event.type || "other";

    eventStartAtInput.value =
        event.start_at || "";

    eventEndAtInput.value =
        event.end_at || "";

    eventLocationInput.value =
        event.location_name || "";

    eventAddressInput.value =
        event.address || "";

    eventUrlInput.value =
        event.external_url || "";

    eventMemoInput.value =
        event.memo || "";

    eventPriorityInput.value =
        event.priority || "normal";


    eventModal.dataset.latitude =
        event.latitude ?? "";

    eventModal.dataset.longitude =
        event.longitude ?? "";


    eventModal.classList.remove(
        "hidden"
    );

}


/* ============================================================
   イベントモーダルを閉じる
   ============================================================ */

export function closeEventModal() {

    eventModal.classList.add(
        "hidden"
    );

}


/* ============================================================
   閉じるボタン
   ============================================================ */

closeEventModalButton.addEventListener(
    "click",
    closeEventModal
);


cancelEventButton.addEventListener(
    "click",
    closeEventModal
);


/* ============================================================
   イベントフォームデータ取得
   ============================================================ */

export function getEventFormData() {

    return {
        title:
            eventTitleInput.value.trim(),

        type:
            eventTypeInput.value,

        start_at:
            eventStartAtInput.value || null,

        end_at:
            eventEndAtInput.value || null,

        location_name:
            eventLocationInput.value.trim() || null,

        address:
            eventAddressInput.value.trim() || null,

        latitude:
            eventModal.dataset.latitude || null,

        longitude:
            eventModal.dataset.longitude || null,

        external_url:
            eventUrlInput.value.trim() || null,

        memo:
            eventMemoInput.value.trim() || null,

        priority:
            eventPriorityInput.value
    };
}