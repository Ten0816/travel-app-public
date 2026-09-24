import {
    tripListView,
    tripDetailView,
    tripDetailName,
    tripDetailDate,
    tripDetailPeriod,
    tripDetailDescription,
    scheduleList,
    createScheduleButton,
    scheduleForm
} from "../dom.js";


import {
    getTrip,
    deleteTrip
} from "../api/trips.js";


import {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from "../api/schedules.js";


import {
    getCurrentTrip,
    setCurrentTrip
} from "../state.js";


import {
    loadTrips
} from "./tripList.js";


import {
    formatPeriod
} from "../utils/date.js";


import {
    escapeHtml
} from "../utils/html.js";


import {
    showAlert,
    showConfirm
} from "../modal/modal.js";


import {
    openScheduleModal,
    openScheduleEditModal,
    getScheduleFormData,
    getEditingScheduleId,
    closeScheduleModalFromOutside
} from "../modal/scheduleModal.js";


/* ============================================================
   旅行詳細を開く
   ============================================================ */

export async function openTripDetail(id) {

    try {

        const trip =
            await getTrip(id);


        const schedules =
            await getSchedules(id);


        setCurrentTrip(trip);


        renderTripDetail(trip);

        renderSchedules(schedules);


        tripListView.classList.add(
            "hidden"
        );

        tripDetailView.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(error);


        await showAlert(
            "旅行情報を取得できませんでした。"
        );

    }

}


/* ============================================================
   旅行詳細を表示
   ============================================================ */

export function renderTripDetail(trip) {

    tripDetailName.textContent =
        trip.name;


    const period =
        formatPeriod(
            trip.start_date,
            trip.end_date
        );


    tripDetailDate.textContent =
        period;


    tripDetailPeriod.textContent =
        period || "未設定";


    tripDetailDescription.textContent =
        trip.description ||
        "メモはありません。";

}


/* ============================================================
   予定一覧を表示
   ============================================================ */

export function renderSchedules(schedules) {

    if (schedules.length === 0) {

        scheduleList.innerHTML = `
            <p class="section-description">
                予定はまだありません。
            </p>
        `;

        return;
    }


    scheduleList.innerHTML =
        schedules
            .map(schedule => `

                <div
                    class="schedule-card"
                    data-schedule-id="${schedule.id}"
                >

                    <div class="schedule-time">
                        ${formatScheduleTime(
                            schedule.start_at
                        )}
                    </div>

                    <div class="schedule-content">

                        <h4 class="schedule-title">
                            ${escapeHtml(
                                schedule.title
                            )}
                        </h4>

                        ${
                            schedule.location_name
                                ? `
                                    <p class="schedule-location">
                                        ${escapeHtml(
                                            schedule.location_name
                                        )}
                                    </p>
                                `
                                : ""
                        }

                        ${
                            schedule.description
                                ? `
                                    <p class="schedule-description">
                                        ${escapeHtml(
                                            schedule.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>


                    <div class="schedule-actions">

                        <button
                            type="button"
                            class="secondary-button schedule-edit-button"
                            data-schedule-id="${schedule.id}"
                        >
                            編集
                        </button>

                        <button
                            type="button"
                            class="danger-button schedule-delete-button"
                            data-schedule-id="${schedule.id}"
                        >
                            削除
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ============================================================
   予定日時を表示
   ============================================================ */

function formatScheduleTime(value) {

    if (!value) {
        return "時間未定";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "時間未定";
    }


    return date.toLocaleString(
        "ja-JP",
        {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ============================================================
   予定一覧を再読み込み
   ============================================================ */

async function reloadSchedules() {

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

async function handleEditSchedule(
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

async function handleDeleteSchedule(
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
   旅行一覧へ戻る
   ============================================================ */

export function showTripList() {

    setCurrentTrip(null);


    tripDetailView.classList.add(
        "hidden"
    );

    tripListView.classList.remove(
        "hidden"
    );


    loadTrips();

}


/* ============================================================
   旅行削除
   ============================================================ */

export async function handleDeleteTrip() {

    const currentTrip =
        getCurrentTrip();


    if (!currentTrip) {
        return;
    }


    const confirmed =
        await showConfirm(
            "この旅行を削除しますか？",
            "この操作は元に戻せません。"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteTrip(
            currentTrip.id
        );


        showTripList();


    } catch (error) {

        console.error(error);


        await showAlert(
            error.message
        );

    }

}


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
