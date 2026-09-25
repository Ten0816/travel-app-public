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
    moveEventToSchedule
} from "../../api/events.js";

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
    addScheduleToList
} from "./scheduleRender.js";

import {
    removeEventFromList
} from "../event.js";

import "./scheduleActions.js";


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

            const editingScheduleId =
                getEditingScheduleId();


            /* ====================================================
               既存予定の編集
               ==================================================== */

            if (editingScheduleId) {

                const data =
                    getScheduleFormData();


                const updatedSchedule =
                    await updateSchedule(
                        editingScheduleId,
                        data
                    );


                /*
                 * サーバーから返ってきた
                 * 最新データで一覧を更新
                 *
                 * 日時を変更した場合も、
                 * addScheduleToList() が
                 * 正しい位置へ移動してくれる。
                 */
                addScheduleToList(
                    updatedSchedule
                );


                closeScheduleModalFromOutside();


                return;

            }


            /* ====================================================
               候補イベント → 予定
               ==================================================== */

            const sourceEventId =
                scheduleModal.dataset.sourceEventId;


            if (sourceEventId) {

                const data =
                    getScheduleFormData();


                const result =
                    await moveEventToSchedule(
                        Number(sourceEventId),
                        data
                    );


                /*
                 * 移動元の候補イベントを削除
                 */
                removeEventFromList(
                    Number(sourceEventId)
                );


                /*
                 * 移動先の予定を追加
                 */
                if (result.schedule) {

                    addScheduleToList(
                        result.schedule
                    );

                }


                closeScheduleModalFromOutside();


                return;

            }


            /* ====================================================
               通常の新規予定作成
               ==================================================== */

            const data =
                getScheduleFormData();


            const newSchedule =
                await createSchedule(
                    currentTrip.id,
                    data
                );


            /*
             * 作成された予定を
             * DOMへ直接追加
             */
            addScheduleToList(
                newSchedule
            );


            closeScheduleModalFromOutside();

        } catch (error) {

            console.error(error);


            await showAlert(
                error.message ||
                "予定の保存に失敗しました。"
            );

        }

    }
);