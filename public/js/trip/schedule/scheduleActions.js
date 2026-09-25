import {
    scheduleList
} from "../../dom.js";

import {
    getSchedules,
    deleteSchedule
} from "../../api/schedules.js";

import {
    createEvent
} from "../../api/events.js";

import {
    getCurrentTrip
} from "../../state.js";

import {
    showAlert,
    showConfirm
} from "../../modal/modal.js";

import {
    openScheduleEditModal
} from "../../modal/scheduleModal.js";

import {
    renderSchedules
} from "./scheduleRender.js";

import {
    reloadEvents
} from "../event.js";


/* ============================================================
   予定一覧を再読み込み
   ============================================================ */

export async function reloadSchedules() {

    const currentTrip =
        getCurrentTrip();


    if (!currentTrip) {
        return;
    }


    const schedules =
        await getSchedules(
            currentTrip.id
        );


    renderSchedules(
        schedules
    );

}


/* ============================================================
   予定編集
   ============================================================ */

export async function handleEditSchedule(
    scheduleId
) {

    const currentTrip =
        getCurrentTrip();


    if (!currentTrip) {
        return;
    }


    try {

        const schedules =
            await getSchedules(
                currentTrip.id
            );


        const schedule =
            schedules.find(
                item =>
                    item.id === scheduleId
            );


        if (!schedule) {

            await showAlert(
                "予定が見つかりません。"
            );

            return;
        }


        openScheduleEditModal(
            schedule
        );

    } catch (error) {

        console.error(error);


        await showAlert(
            error.message
        );

    }

}


/* ============================================================
   予定削除
   ============================================================ */

export async function handleDeleteSchedule(
    scheduleId
) {

    const confirmed =
        await showConfirm(
            "この予定を削除しますか？",
            "この操作は元に戻せません。"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteSchedule(
            scheduleId
        );


        await reloadSchedules();

    } catch (error) {

        console.error(error);


        await showAlert(
            error.message
        );

    }

}


/* ============================================================
   予定を候補イベントに戻す
   ============================================================ */

export async function handleMoveScheduleToEvent(
    scheduleId
) {

    const currentTrip =
        getCurrentTrip();


    if (!currentTrip) {
        return;
    }


    const confirmed =
        await showConfirm(
            "この予定を候補イベントに戻しますか？",
            "現在の予定は削除されます。"
        );


    if (!confirmed) {
        return;
    }


    try {

        const schedules =
            await getSchedules(
                currentTrip.id
            );


        const schedule =
            schedules.find(
                item =>
                    item.id === scheduleId
            );


        if (!schedule) {

            await showAlert(
                "予定が見つかりません。"
            );

            return;
        }


        /*
         * 予定 → 候補イベント
         *
         * schedules.description
         *        ↓
         * events.memo
         */
        await createEvent(
            currentTrip.id,
            {
                title:
                    schedule.title,

                type:
                    schedule.type,

                start_at:
                    schedule.start_at,

                end_at:
                    schedule.end_at,

                location_name:
                    schedule.location_name,

                address:
                    schedule.address,

                external_url:
                    schedule.external_url,

                memo:
                    schedule.description,

                priority:
                    schedule.priority,

                visited:
                    false
            }
        );


        /*
         * 候補イベントの作成に成功したら
         * 元の予定を削除
         */
        await deleteSchedule(
            schedule.id
        );


        /*
         * 両方の一覧を更新
         */
        await reloadSchedules();
        await reloadEvents();

    } catch (error) {

        console.error(error);


        await showAlert(
            error.message ||
            "候補イベントへの移動に失敗しました。"
        );

    }

}


/* ============================================================
   予定カードの操作
   ============================================================ */

scheduleList.addEventListener(
    "click",
    event => {

        const editButton =
            event.target.closest(
                ".schedule-edit-button"
            );


        if (editButton) {

            const scheduleId =
                Number(
                    editButton.dataset.scheduleId
                );


            handleEditSchedule(
                scheduleId
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                ".schedule-delete-button"
            );


        if (deleteButton) {

            const scheduleId =
                Number(
                    deleteButton.dataset.scheduleId
                );


            handleDeleteSchedule(
                scheduleId
            );

            return;
        }


        const returnEventButton =
            event.target.closest(
                ".schedule-return-event-button"
            );


        if (returnEventButton) {

            const scheduleId =
                Number(
                    returnEventButton.dataset.scheduleId
                );


            handleMoveScheduleToEvent(
                scheduleId
            );

        }

    }
);