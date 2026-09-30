import {
    scheduleList
} from "../../dom.js";

import {
    getSchedules,
    deleteSchedule,
    moveScheduleToEvent,
    updateScheduleStatus,
    updateScheduleOrder
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
    getSchedulesFromList,
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
   予定の並び順を変更
   ============================================================ */

export async function handleMoveSchedule(
    scheduleId,
    direction
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


    const schedules =
        getSchedulesFromList();


    /*
     * 現在の予定と同じ日付の予定だけを取得
     */
    const currentDate =
        getScheduleDateKey(
            schedule.start_at
        );


    const sameDaySchedules =
        schedules
            .filter(
                item =>
                    getScheduleDateKey(
                        item.start_at
                    ) === currentDate
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    const aOrder =
                        Number.isInteger(
                            a.sort_order
                        )
                            ? a.sort_order
                            : Number.MAX_SAFE_INTEGER;


                    const bOrder =
                        Number.isInteger(
                            b.sort_order
                        )
                            ? b.sort_order
                            : Number.MAX_SAFE_INTEGER;


                    if (
                        aOrder !==
                        bOrder
                    ) {

                        return aOrder -
                            bOrder;

                    }


                    return (
                        new Date(
                            a.start_at || 0
                        ).getTime()
                    ) -
                    (
                        new Date(
                            b.start_at || 0
                        ).getTime()
                    );

                }
            );


    const currentIndex =
        sameDaySchedules.findIndex(
            item =>
                item.id ===
                scheduleId
        );


    if (
        currentIndex === -1
    ) {
        return;
    }


    const targetIndex =
        direction === "up"
            ? currentIndex - 1
            : currentIndex + 1;


    /*
     * 先頭・末尾
     */
    if (
        targetIndex < 0 ||
        targetIndex >=
            sameDaySchedules.length
    ) {

        return;

    }


    /*
     * 配列上で入れ替える
     */
    const reordered =
        [
            ...sameDaySchedules
        ];


    const temp =
        reordered[currentIndex];


    reordered[currentIndex] =
        reordered[targetIndex];


    reordered[targetIndex] =
        temp;


    /*
     * 同じ日付グループの
     * sort_order を振り直す
     */
    reordered.forEach(
        (
            item,
            index
        ) => {

            item.sort_order =
                index;

        }
    );


    try {

        /*
         * DBへ保存
         */
        await Promise.all(
            reordered.map(
                item =>
                    updateScheduleOrder(
                        item.id,
                        item.sort_order
                    )
            )
        );


        /*
         * 保存成功後に再描画
         */
        renderSchedules(
            getSchedulesFromList()
        );

    } catch (error) {

        console.error(
            "handleMoveSchedule error:",
            error
        );


        /*
         * DB保存に失敗した場合は
         * サーバー側の状態を再取得
         */
        await reloadSchedules();


        await showAlert(
            error.message ||
            "予定の並び順を変更できませんでした。"
        );

    }

}


/* ============================================================
   予定の日付キー
   ============================================================ */

function getScheduleDateKey(
    startAt
) {

    if (!startAt) {
        return "unknown";
    }


    const date =
        new Date(
            startAt
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "unknown";
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

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
         * 並び順を上へ
         */
        const moveUpButton =
            event.target.closest(
                ".schedule-move-up-button"
            );


        if (moveUpButton) {

            const scheduleId =
                Number(
                    moveUpButton.dataset.scheduleId
                );


            handleMoveSchedule(
                scheduleId,
                "up"
            );


            return;

        }


        /*
         * 並び順を下へ
         */
        const moveDownButton =
            event.target.closest(
                ".schedule-move-down-button"
            );


        if (moveDownButton) {

            const scheduleId =
                Number(
                    moveDownButton.dataset.scheduleId
                );


            handleMoveSchedule(
                scheduleId,
                "down"
            );


            return;

        }

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