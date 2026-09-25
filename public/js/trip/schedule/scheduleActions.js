import {
    scheduleList
} from "../../dom.js";

import {
    getSchedules,
    deleteSchedule
} from "../../api/schedules.js";

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

        }

    }
);