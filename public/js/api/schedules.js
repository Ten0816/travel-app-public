import { apiRequest } from "./client.js";


/* ============================================================
   予定一覧取得
   ============================================================ */

export function getSchedules(tripId) {

    return apiRequest(
        `/trips/${tripId}/schedules`,
        {},
        "予定を取得できませんでした。"
    );
}


/* ============================================================
   予定作成
   ============================================================ */

export function createSchedule(tripId, data) {

    return apiRequest(
        `/trips/${tripId}/schedules`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "予定の作成に失敗しました。"
    );
}


/* ============================================================
   予定更新
   ============================================================ */

export function updateSchedule(id, data) {

    return apiRequest(
        `/schedules/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "予定の更新に失敗しました。"
    );
}


/* ============================================================
   予定ステータス変更
   ============================================================ */

export function updateScheduleStatus(id, status) {

    return apiRequest(
        `/schedules/${id}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status
            })
        },
        "予定の実施状態を変更できませんでした。"
    );
}


/* ============================================================
   予定並び順更新
   ============================================================ */

export function updateScheduleOrders(orders) {

    return apiRequest(
        "/schedules/order",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orders
            })
        },
        "予定の並び順を変更できませんでした。"
    );
}


/* ============================================================
   予定 → 候補イベント
   ============================================================ */

export function moveScheduleToEvent(id) {

    return apiRequest(
        `/schedules/${id}/move-to-event`,
        {
            method: "POST"
        },
        "候補イベントへの移動に失敗しました。"
    );
}


/* ============================================================
   予定削除
   ============================================================ */

export function deleteSchedule(id) {

    return apiRequest(
        `/schedules/${id}`,
        {
            method: "DELETE"
        },
        "予定の削除に失敗しました。"
    );
}