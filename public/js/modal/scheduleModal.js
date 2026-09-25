import {
    scheduleModal,
    scheduleModalTitle,
    closeScheduleModalButton,
    cancelScheduleButton,
    scheduleForm,
    scheduleTitleInput,
    scheduleTypeInput,
    scheduleStartAtInput,
    scheduleEndAtInput,
    scheduleLocationInput,
    scheduleAddressInput,
    scheduleUrlInput,
    schedulePriorityInput,
    scheduleDescriptionInput
} from "../dom.js";


/* ============================================================
   モーダルを閉じる
   ============================================================ */

function closeScheduleModal() {

    scheduleModal.classList.add(
        "hidden"
    );

}


/* ============================================================
   予定追加モーダルを開く
   ============================================================ */

export function openScheduleModal(
    initialData = null
) {

    scheduleModalTitle.textContent =
        "予定を追加";


    scheduleForm.reset();

    scheduleModal.dataset.scheduleId =
        "";

    scheduleModal.dataset.latitude =
        "";

    scheduleModal.dataset.longitude =
        "";


    if (initialData) {

        scheduleTitleInput.value =
            initialData.title || "";

        scheduleTypeInput.value =
            initialData.type || "other";

        scheduleStartAtInput.value =
            formatDateTimeLocal(
                initialData.start_at
            );

        scheduleEndAtInput.value =
            formatDateTimeLocal(
                initialData.end_at
            );

        scheduleLocationInput.value =
            initialData.location_name || "";

        scheduleAddressInput.value =
            initialData.address || "";

        scheduleUrlInput.value =
            initialData.external_url || "";

        schedulePriorityInput.value =
            initialData.priority || "normal";

        scheduleModal.dataset.latitude =
            initialData.latitude ?? "";

        scheduleModal.dataset.longitude =
            initialData.longitude ?? "";

        scheduleDescriptionInput.value =
            initialData.description || "";

    }


    scheduleModal.classList.remove(
        "hidden"
    );


    scheduleTitleInput.focus();

}


/* ============================================================
   予定編集モーダルを開く
   ============================================================ */

export function openScheduleEditModal(
    schedule
) {

    scheduleModalTitle.textContent =
        "予定を編集";


    scheduleModal.dataset.scheduleId =
        String(schedule.id);


    scheduleTitleInput.value =
        schedule.title || "";


    scheduleTypeInput.value =
        schedule.type || "other";


    scheduleStartAtInput.value =
        formatDateTimeLocal(
            schedule.start_at
        );


    scheduleEndAtInput.value =
        formatDateTimeLocal(
            schedule.end_at
        );


    scheduleLocationInput.value =
        schedule.location_name || "";

    scheduleAddressInput.value =
        schedule.address || "";

    scheduleUrlInput.value =
        schedule.external_url || "";

    schedulePriorityInput.value =
        schedule.priority || "normal";

    scheduleModal.dataset.latitude =
        schedule.latitude ?? "";

    scheduleModal.dataset.longitude =
        schedule.longitude ?? "";

    scheduleDescriptionInput.value =
        schedule.description || "";


    scheduleModal.classList.remove(
        "hidden"
    );


    scheduleTitleInput.focus();

}


/* ============================================================
   datetime-local 用に日時を変換
   ============================================================ */

function formatDateTimeLocal(value) {

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


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return `${year}-${month}-${day}T${hours}:${minutes}`;

}


/* ============================================================
   イベント
   ============================================================ */

closeScheduleModalButton.addEventListener(
    "click",
    closeScheduleModal
);


cancelScheduleButton.addEventListener(
    "click",
    closeScheduleModal
);


scheduleModal.addEventListener(
    "click",
    event => {

        if (
            event.target === scheduleModal ||
            event.target.classList.contains(
                "modal-backdrop"
            )
        ) {

            closeScheduleModal();

        }

    }
);


/* ============================================================
   フォームデータ取得
   ============================================================ */

export function getScheduleFormData() {
    return {
        title:
            scheduleTitleInput.value,

        type:
            scheduleTypeInput.value,

        start_at:
            scheduleStartAtInput.value,

        end_at:
            scheduleEndAtInput.value,

        location_name:
            scheduleLocationInput.value,

        address:
            scheduleAddressInput.value,

        external_url:
            scheduleUrlInput.value,

        priority:
            schedulePriorityInput.value,

        latitude:
            scheduleModal.dataset.latitude || null,

        longitude:
            scheduleModal.dataset.longitude || null,

        description:
            scheduleDescriptionInput.value
    };
}


/* ============================================================
   編集中の予定IDを取得
   ============================================================ */

export function getEditingScheduleId() {

    const id =
        scheduleModal.dataset.scheduleId;


    if (!id) {
        return null;
    }


    return Number(id);

}


/* ============================================================
   外部からモーダルを閉じる
   ============================================================ */

export function closeScheduleModalFromOutside() {

    closeScheduleModal();

}
