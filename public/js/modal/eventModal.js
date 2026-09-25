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

        external_url:
            eventUrlInput.value.trim() || null,

        memo:
            eventMemoInput.value.trim() || null,

        priority:
            eventPriorityInput.value
    };
}