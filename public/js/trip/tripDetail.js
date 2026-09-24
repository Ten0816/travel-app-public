import {
  tripListView,
  tripDetailView,
  tripDetailName,
  tripDetailDate,
  tripDetailPeriod,
  tripDetailDescription,
  scheduleList
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
  formatPeriod
} from "../utils/date.js";

import {
  escapeHtml
} from "../utils/html.js";

import {
  showAlert,
  showConfirm
} from "../modal/modal.js";


export async function openTripDetail(id) {
  try {
    const trip = await getTrip(id);
    const schedules = await getSchedules(id);

    setCurrentTrip(trip);

    renderTripDetail(trip);
    renderSchedules(schedules);

    tripListView.classList.add("hidden");
    tripDetailView.classList.remove("hidden");

  } catch (error) {
    console.error(error);

    await showAlert(
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


export function renderSchedules(schedules) {
  if (schedules.length === 0) {
    scheduleList.innerHTML = `
      <p class="section-description">
        予定はまだありません。
      </p>
    `;

    return;
  }

  scheduleList.innerHTML = schedules
    .map(schedule => `
      <div class="schedule-card">

        <div class="schedule-time">
          ${formatScheduleTime(schedule.start_at)}
        </div>

        <div class="schedule-content">

          <h4 class="schedule-title">
            ${escapeHtml(schedule.title)}
          </h4>

          ${
            schedule.location_name
              ? `
                <p class="schedule-location">
                  ${escapeHtml(schedule.location_name)}
                </p>
              `
              : ""
          }

          ${
            schedule.description
              ? `
                <p class="schedule-description">
                  ${escapeHtml(schedule.description)}
                </p>
              `
              : ""
          }

        </div>

      </div>
    `)
    .join("");
}


function formatScheduleTime(value) {
  if (!value) {
    return "時間未定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

  const confirmed = await showConfirm(
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