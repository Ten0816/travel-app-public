import {
    createScheduleButton,
    scheduleForm
} from "../../dom.js";

import {
    createSchedule,
    updateSchedule
} from "../../api/schedules.js";

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


            if (editingScheduleId) {

                await updateSchedule(
                    editingScheduleId,
                    data
                );

            } else {

                await createSchedule(
                    currentTrip.id,
                    data
                );

            }


            closeScheduleModalFromOutside();


            await reloadSchedules();


        } catch (error) {

            console.error(error);


            await showAlert(
                error.message
            );

        }

    }
);