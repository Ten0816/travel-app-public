import {
    tripList
} from "../dom.js";

import {
    getTrips
} from "../api/trips.js";

import {
    formatPeriod
} from "../utils/date.js";

import {
    escapeHtml
} from "../utils/html.js";

let onTripSelect = null;

export function setTripSelectHandler(handler) {
    onTripSelect = handler;
}

export async function loadTrips() {
    try {
        const trips = await getTrips();

        renderTripList(trips);

    } catch (error) {
        console.error(error);

        tripList.innerHTML = `
            <div class="empty-message">
                旅行情報の読み込みに失敗しました。
            </div>
        `;
    }
}

export function renderTripList(trips) {
    if (trips.length === 0) {
        tripList.innerHTML = `
            <div class="empty-message">
                まだ旅行がありません。
            </div>
        `;

        tripList.className = "";

        return;
    }

    tripList.className = "trip-list";

    tripList.innerHTML = trips
        .map(trip => `
            <button
                class="trip-card"
                data-trip-id="${trip.id}"
            >
                <h3 class="trip-card-name">
                    ${escapeHtml(trip.name)}
                </h3>

                <p class="trip-card-date">
                    ${escapeHtml(
                        formatPeriod(
                            trip.start_date,
                            trip.end_date
                        )
                    )}
                </p>
            </button>
        `)
        .join("");

    tripList
        .querySelectorAll(".trip-card")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        Number(button.dataset.tripId);

                    if (onTripSelect) {
                        onTripSelect(id);
                    }
                }
            );
        });
}