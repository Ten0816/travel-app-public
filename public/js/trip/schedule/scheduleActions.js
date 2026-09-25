import {
    scheduleList
} from "../../dom.js";

import {
    getSchedules,
    deleteSchedule,
    moveScheduleToEvent
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
    renderSchedules,
    getScheduleById,
    removeScheduleFromList
} from "./scheduleRender.js";

import {
    addEventToList
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

    const schedule =
        getScheduleById(
            scheduleId
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


        /*
         * サーバー削除成功後、
         * DOMとローカルMapから削除
         */
        removeScheduleFromList(
            scheduleId
        );

    } catch (error) {

        console.error(error);


        await showAlert(
            error.message ||
            "予定の削除に失敗しました。"
        );

    }

}


/* ============================================================
   予定を候補イベントに戻す
   ============================================================ */

export async function handleMoveScheduleToEvent(scheduleId) {

    const confirmed =
        await showConfirm(
            "この予定を候補イベントに戻しますか？",
            "現在の予定は削除されます。"
        );


    if (!confirmed) {
        return;
    }


    try {

        const result =
            await moveScheduleToEvent(
                scheduleId
            );


        console.log(
            "moveScheduleToEvent result:",
            result
        );


        if (!result || !result.event) {

            throw new Error(
                "候補イベントの作成結果を取得できませんでした。"
            );

        }


        /*
         * 候補イベントとして追加
         */
        addEventToList(
            result.event
        );


        /*
         * 元の予定を削除
         */
        removeScheduleFromList(
            scheduleId
        );


    } catch (error) {

        console.error(
            "handleMoveScheduleToEvent error:",
            error
        );


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