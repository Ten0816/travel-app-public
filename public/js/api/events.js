import { apiRequest } from "./client.js";


/* ============================================================
   候補イベント一覧取得
   ============================================================ */

export function getEvents(tripId) {

    return apiRequest(
        `/trips/${tripId}/events`,
        {},
        "候補イベントを取得できませんでした。"
    );
}


/* ============================================================
   候補イベント作成
   ============================================================ */

export function createEvent(tripId, data) {

    return apiRequest(
        `/trips/${tripId}/events`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "候補イベントの作成に失敗しました。"
    );
}


/* ============================================================
   候補イベント更新
   ============================================================ */

export function updateEvent(id, data) {

    return apiRequest(
        `/events/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "候補イベントの更新に失敗しました。"
    );
}


/* ============================================================
   訪問済み状態変更
   ============================================================ */

export function updateEventVisited(id, visited) {

    return apiRequest(
        `/events/${id}/visited`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                visited
            })
        },
        "訪問済み状態の変更に失敗しました。"
    );
}


/* ============================================================
   候補イベント削除
   ============================================================ */

export function deleteEvent(id) {

    return apiRequest(
        `/events/${id}`,
        {
            method: "DELETE"
        },
        "候補イベントの削除に失敗しました。"
    );
}


/* ============================================================
   候補イベント → 予定
   ============================================================ */

export function moveEventToSchedule(id, data) {

    return apiRequest(
        `/events/${id}/move-to-schedule`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "候補イベントを予定に移動できませんでした。"
    );
}