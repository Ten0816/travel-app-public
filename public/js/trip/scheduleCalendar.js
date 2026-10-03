import {
    scheduleCalendar
} from "../dom.js";

import {
    openScheduleEditModal
} from "../modal/scheduleModal.js";


// ============================================================
// タイムカレンダー
// ============================================================

const HOUR_HEIGHT = 60;

const CALENDAR_START_HOUR = 0;
const CALENDAR_END_HOUR = 24;

let currentDateKey = null;
let currentSchedules = [];


// ============================================================
// 公開
// ============================================================

export function renderScheduleCalendar(schedules) {

    currentSchedules = Array.isArray(schedules)
        ? schedules
        : [];

    if (!scheduleCalendar) {
        return;
    }

    const datedSchedules =
        currentSchedules.filter(
            schedule => getDateKey(schedule.start_at)
        );

    if (datedSchedules.length === 0) {

        scheduleCalendar.innerHTML = `
            <div class="schedule-calendar-empty">
                時間が設定された予定はありません。
            </div>
        `;

        currentDateKey = null;

        return;
    }


    const dateKeys =
        Array.from(
            new Set(
                datedSchedules.map(
                    schedule => getDateKey(schedule.start_at)
                )
            )
        ).sort();


    if (
        !currentDateKey ||
        !dateKeys.includes(currentDateKey)
    ) {
        currentDateKey = dateKeys[0];
    }


    renderCalendar(dateKeys);
}


// ============================================================
// カレンダー全体
// ============================================================

function renderCalendar(dateKeys) {

    const schedules =
        currentSchedules.filter(
            schedule =>
                getDateKey(schedule.start_at) === currentDateKey
        );


    scheduleCalendar.innerHTML = `

        <div class="schedule-calendar-header">

            <div class="schedule-calendar-title">
                ${formatCalendarDate(currentDateKey)}
            </div>

            <div class="schedule-calendar-date-list">

                ${dateKeys.map(dateKey => `

                    <button
                        type="button"
                        class="schedule-calendar-date-button
                            ${dateKey === currentDateKey ? "active" : ""}"
                        data-calendar-date="${dateKey}"
                    >
                        ${formatCalendarDateShort(dateKey)}
                    </button>

                `).join("")}

            </div>

        </div>


        <div class="schedule-calendar-body">

            <div class="schedule-calendar-hours">

                ${createHourLabels()}

            </div>


            <div class="schedule-calendar-timeline">

                ${createHourLines()}

                <div class="schedule-calendar-events">

                    ${schedules
                        .filter(schedule => schedule.start_at)
                        .map(createCalendarEvent)
                        .join("")
                    }

                </div>

            </div>

        </div>
    `;


    bindCalendarEvents();
}


// ============================================================
// 時間ラベル
// ============================================================

function createHourLabels() {

    const labels = [];

    for (
        let hour = CALENDAR_START_HOUR;
        hour < CALENDAR_END_HOUR;
        hour++
    ) {

        labels.push(`
            <div
                class="schedule-calendar-hour-label"
                style="height:${HOUR_HEIGHT}px"
            >
                ${String(hour).padStart(2, "0")}:00
            </div>
        `);
    }

    return labels.join("");
}


// ============================================================
// 時間線
// ============================================================

function createHourLines() {

    const lines = [];

    for (
        let hour = CALENDAR_START_HOUR;
        hour <= CALENDAR_END_HOUR;
        hour++
    ) {

        const top =
            (hour - CALENDAR_START_HOUR) *
            HOUR_HEIGHT;

        lines.push(`
            <div
                class="schedule-calendar-hour-line"
                style="top:${top}px"
            ></div>
        `);
    }

    return lines.join("");
}


// ============================================================
// カレンダー予定
// ============================================================

function createCalendarEvent(schedule) {

    const startDate =
        new Date(schedule.start_at);

    if (
        Number.isNaN(
            startDate.getTime()
        )
    ) {
        return "";
    }


    let startMinutes =
        startDate.getHours() * 60 +
        startDate.getMinutes();


    let endMinutes =
        startMinutes + 60;


    if (schedule.end_at) {

        const endDate =
            new Date(schedule.end_at);

        if (
            !Number.isNaN(
                endDate.getTime()
            )
        ) {

            const sameDate =
                getDateKey(schedule.start_at) ===
                getDateKey(schedule.end_at);

            if (sameDate) {

                endMinutes =
                    endDate.getHours() * 60 +
                    endDate.getMinutes();

            } else {

                endMinutes = 24 * 60;

            }
        }
    }


    startMinutes =
        Math.max(
            0,
            Math.min(24 * 60, startMinutes)
        );


    endMinutes =
        Math.max(
            startMinutes + 30,
            Math.min(24 * 60, endMinutes)
        );


    const top =
        startMinutes *
        (HOUR_HEIGHT / 60);


    const height =
        Math.max(
            30,
            (endMinutes - startMinutes) *
            (HOUR_HEIGHT / 60)
        );


    const status =
        schedule.status || "planned";


    return `

        <button
            type="button"
            class="
                schedule-calendar-event
                schedule-calendar-event-${escapeAttribute(status)}
            "
            data-schedule-id="${schedule.id}"
            style="
                top:${top}px;
                height:${height}px;
            "
        >

            <span class="schedule-calendar-event-time">
                ${formatTime(schedule.start_at)}
                ${schedule.end_at
                    ? `～${formatTime(schedule.end_at)}`
                    : ""
                }
            </span>

            <span class="schedule-calendar-event-title">
                ${escapeHtml(schedule.title)}
            </span>

            ${
                schedule.location_name
                    ? `
                        <span class="schedule-calendar-event-location">
                            ${escapeHtml(schedule.location_name)}
                        </span>
                    `
                    : ""
            }

        </button>
    `;
}


// ============================================================
// イベント
// ============================================================

function bindCalendarEvents() {

    scheduleCalendar
        .querySelectorAll(
            "[data-calendar-date]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentDateKey =
                        button.dataset.calendarDate;

                    const dateKeys =
                        Array.from(
                            new Set(
                                currentSchedules
                                    .filter(
                                        schedule =>
                                            getDateKey(
                                                schedule.start_at
                                            )
                                    )
                                    .map(
                                        schedule =>
                                            getDateKey(
                                                schedule.start_at
                                            )
                                    )
                            )
                        ).sort();

                    renderCalendar(dateKeys);
                }
            );
        });


    scheduleCalendar
        .querySelectorAll(
            ".schedule-calendar-event"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const scheduleId =
                        Number(
                            button.dataset.scheduleId
                        );

                    openExistingSchedule(
                        scheduleId
                    );
                }
            );
        });
}


// ============================================================
// 既存の予定編集処理を使用
// ============================================================

function openExistingSchedule(scheduleId) {

    const schedule =
        currentSchedules.find(
            schedule =>
                Number(schedule.id) ===
                scheduleId
        );

    if (!schedule) {
        return;
    }

    openScheduleEditModal(
        schedule
    );
}


// ============================================================
// 日付
// ============================================================

function getDateKey(dateValue) {

    if (!dateValue) {
        return null;
    }


    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function formatCalendarDate(dateKey) {

    const date =
        parseDateKey(dateKey);

    if (!date) {
        return "";
    }


    const weekday =
        date.toLocaleDateString(
            "ja-JP",
            {
                weekday: "short"
            }
        );


    return `
        ${date.getMonth() + 1}月
        ${date.getDate()}日
        （${weekday}）
    `;
}


function formatCalendarDateShort(dateKey) {

    const date =
        parseDateKey(dateKey);

    if (!date) {
        return "";
    }


    return `
        ${date.getMonth() + 1}/${date.getDate()}
    `;
}


function parseDateKey(dateKey) {

    const [
        year,
        month,
        day
    ] = dateKey
        .split("-")
        .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return date;
}


// ============================================================
// 時刻
// ============================================================

function formatTime(dateValue) {

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleTimeString(
        "ja-JP",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ============================================================
// HTMLエスケープ
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "");
}