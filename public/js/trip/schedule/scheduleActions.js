import {
    scheduleList
} from "../../dom.js";

import {
    getSchedules,
    deleteSchedule,
    moveScheduleToEvent,
    updateScheduleStatus
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
    removeScheduleFromList,
    addScheduleToList
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
   予定の実施状態を切り替え
   ============================================================ */

export async function handleToggleScheduleStatus(
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


    /*
     * 実施済み → 予定中
     * 予定中・キャンセル → 実施済み
     *
     * キャンセルはボタン自体を表示しないため、
     * 基本的には planned / completed の切り替えになる。
     */
    const nextStatus =
        schedule.status === "completed"
            ? "planned"
            : "completed";


    try {

        const updatedSchedule =
            await updateScheduleStatus(
                scheduleId,
                nextStatus
            );


        /*
         * API成功後、
         * ローカルのMapを更新して再描画
         *
         * GETは発生しない
         */
        addScheduleToList(
            updatedSchedule
        );

    } catch (error) {

        console.error(
            "handleToggleScheduleStatus error:",
            error
        );


        await showAlert(
            error.message ||
            "予定の実施状態を変更できませんでした。"
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

export async function handleMoveScheduleToEvent(
    scheduleId
) {

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


        if (
            !result ||
            !result.event
        ) {

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

        /*
         * 実施状態切り替え
         */
        const statusButton =
            event.target.closest(
                ".schedule-status-toggle-button"
            );


        if (statusButton) {

            const scheduleId =
                Number(
                    statusButton.dataset.scheduleId
                );


            handleToggleScheduleStatus(
                scheduleId
            );


            return;

        }


        /*
         * 編集
         */
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


        /*
         * 削除
         */
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


        /*
         * 候補イベントに戻す
         */
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