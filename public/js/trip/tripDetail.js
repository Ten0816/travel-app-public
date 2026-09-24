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
    getCurrentTrip,
    setCurrentTrip
} from "../state.js";

import {
    loadTrips
} from "./tripList.js";

import {
    formatPeriod
} from "../utils/date.js";

export async function openTripDetail(id) {
    try {
        const trip = await getTrip(id);

        setCurrentTrip(trip);

        renderTripDetail(trip);

        tripListView.classList.add("hidden");
        tripDetailView.classList.remove("hidden");

    } catch (error) {
        console.error(error);

        alert(
            "旅行情報を取得できませんでした。"
        );
    }
}

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

export function showTripList() {
    setCurrentTrip(null);

    tripDetailView.classList.add("hidden");
    tripListView.classList.remove("hidden");

    loadTrips();
}

export async function handleDeleteTrip() {
    const currentTrip =
        getCurrentTrip();

    if (!currentTrip) {
        return;
    }

    const confirmed =
        window.confirm(
            `「${currentTrip.name}」を削除しますか？\n\nこの操作は元に戻せません。`
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

        alert(error.message);
    }
}