import { apiRequest } from "./client.js";


/* ============================================================
   旅行一覧取得
   ============================================================ */

export function getTrips() {

    return apiRequest(
        "/trips",
        {},
        "旅行情報を取得できませんでした。"
    );
}


/* ============================================================
   旅行取得
   ============================================================ */

export function getTrip(id) {

    return apiRequest(
        `/trips/${id}`,
        {},
        "旅行情報を取得できませんでした。"
    );
}


/* ============================================================
   旅行作成
   ============================================================ */

export function createTrip(data) {

    return apiRequest(
        "/trips",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "旅行の作成に失敗しました。"
    );
}


/* ============================================================
   旅行更新
   ============================================================ */

export function updateTrip(id, data) {

    return apiRequest(
        `/trips/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        },
        "旅行の更新に失敗しました。"
    );
}


/* ============================================================
   旅行削除
   ============================================================ */

export function deleteTrip(id) {

    return apiRequest(
        `/trips/${id}`,
        {
            method: "DELETE"
        },
        "旅行の削除に失敗しました。"
    );
}