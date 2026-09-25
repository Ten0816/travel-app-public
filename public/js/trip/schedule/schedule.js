import {
    createScheduleButton,
    scheduleForm,
    scheduleModal
} from "../../dom.js";

import {
    createSchedule,
    updateSchedule
} from "../../api/schedules.js";

import {
    deleteEvent
} from "../../api/events.js";

import {
    reloadEvents
} from "../event.js";

import {
    getCurrentTrip
} from "../../state.js";

import {
    showAlert
} from "../../modal/modal.js";

import {
    openScheduleModal,
    getScheduleFormData,
    getEditingScheduleId,
    closeScheduleModalFromOutside
} from "../../modal/scheduleModal.js";

import {
    reloadSchedules
} from "./scheduleActions.js";


/* ============================================================
   予定追加モーダル
   ============================================================ */

createScheduleButton.addEventListener(
    "click",
    () => {

        openScheduleModal();

    }
);


/* ============================================================
   予定フォーム送信
   ============================================================ */

scheduleForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const currentTrip =
            getCurrentTrip();


        if (!currentTrip) {
            return;
        }


        try {

            const data =
                getScheduleFormData();


            const editingScheduleId =
                getEditingScheduleId();


            /*
             * 既存予定の編集
             */
            if (editingScheduleId) {

                await updateSchedule(
                    editingScheduleId,
                    data
                );

            }


            /*
             * 新規予定の作成
             */
            else {

                await createSchedule(
                    currentTrip.id,
                    data
                );


                /*
                 * 候補イベントから追加された場合、
                 * 元の候補イベントを削除する
                 */
                const sourceEventId =
                    scheduleModal.dataset.sourceEventId;


                if (sourceEventId) {

                    await deleteEvent(
                        Number(sourceEventId)
                    );

                }

            }


            /*
             * モーダルを閉じる
             */
            closeScheduleModalFromOutside();


            /*
             * 予定・候補イベントを両方更新
             */
            await reloadSchedules();
            await reloadEvents();

        } catch (error) {

            console.error(error);


            await showAlert(
                error.message ||
                "予定の保存に失敗しました。"
            );

        }

    }
);