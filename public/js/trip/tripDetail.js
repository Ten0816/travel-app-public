import {
    tripListView,
    tripDetailView,
    tripDetailName,
    tripDetailDate,
    tripDetailPeriod,
    tripDetailDescription
} from "../dom.js";

import {
    getTrip,
    deleteTrip
} from "../api/trips.js";

import {
    getSchedules
} from "../api/schedules.js";

import {
    getCurrentTrip,
    setCurrentTrip
} from "../state.js";

import {
    loadTrips
} from "./tripList.js";

import {
    renderSchedules
} from "./schedule/scheduleRender.js";

import {
    loadEvents
} from "./event.js";

import {
    formatPeriod
} from "../utils/date.js";

import {
    showAlert,
    showConfirm
} from "../modal/modal.js";


/* ============================================================
   旅行詳細を開く
   ============================================================ */

export async function openTripDetail(
    id,
    updateHistory = true
) {
    try {

        const trip =
            await getTrip(id);

        const schedules =
            await getSchedules(id);

        await loadEvents(id);

        setCurrentTrip(trip);

        renderTripDetail(trip);

        renderSchedules(schedules);


        tripListView.classList.add(
            "hidden"
        );

        tripDetailView.classList.remove(
            "hidden"
        );


        /*
         * 通常の画面遷移の場合だけ
         * ブラウザ履歴に詳細画面を追加する。
         *
         * popstateから呼ばれた場合は
         * 履歴を追加しない。
         */
        if (updateHistory) {

            history.pushState(
                {
                    view: "detail",
                    tripId: trip.id
                },
                "",
                location.href
            );

        }

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
   旅行一覧へ戻る
   ============================================================ */

export function showTripList(
    updateHistory = true
) {

    setCurrentTrip(null);

    tripDetailView.classList.add(
        "hidden"
    );

    tripListView.classList.remove(
        "hidden"
    );

    loadTrips();


    /*
     * アプリ内の「← 旅行一覧」を
     * 押した場合だけ履歴を戻す。
     *
     * popstateから呼ばれた場合は
     * すでに履歴が戻っているので、
     * ここでは何もしない。
     */
    if (
        updateHistory &&
        history.state?.view === "detail"
    ) {

        history.back();

    }

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

        /*
         * 削除後は旅行一覧へ戻る。
         * 履歴も旅行一覧側へ戻す。
         */
        showTripList();

    } catch (error) {

        console.error(error);

        await showAlert(
            error.message
        );

    }

}