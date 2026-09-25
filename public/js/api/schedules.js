export async function getSchedules(
    tripId
) {

    const response =
        await fetch(
            `./api/trips/${tripId}/schedules`
        );


    if (!response.ok) {

        throw new Error(
            "予定情報を取得できませんでした。"
        );

    }


    return response.json();

}


/* ============================================================
   予定作成
   ============================================================ */

export async function createSchedule(
    tripId,
    data
) {

    const response =
        await fetch(
            `./api/trips/${tripId}/schedules`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        let message =
            "予定の作成に失敗しました。";


        try {

            const error =
                await response.json();


            message =
                error.error ||
                message;

        } catch {
        }


        throw new Error(
            message
        );

    }


    return response.json();

}


/* ============================================================
   予定更新
   ============================================================ */

export async function updateSchedule(
    id,
    data
) {

    const response =
        await fetch(
            `./api/schedules/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );


    if (!response.ok) {

        let message =
            "予定の更新に失敗しました。";


        try {

            const error =
                await response.json();


            message =
                error.error ||
                message;

        } catch {
        }


        throw new Error(
            message
        );

    }


    return response.json();

}


/* ============================================================
   予定 → 候補イベント
   ============================================================ */

export async function moveScheduleToEvent(
    id
) {

    const response =
        await fetch(
            `./api/schedules/${id}/move-to-event`,
            {
                method: "POST"
            }
        );


    if (!response.ok) {

        let message =
            "予定を候補イベントに移動できませんでした。";


        try {

            const error =
                await response.json();


            message =
                error.error ||
                message;

        } catch {
        }


        throw new Error(
            message
        );

    }


    return response.json();

}


/* ============================================================
   予定削除
   ============================================================ */

export async function deleteSchedule(
    id
) {

    const response =
        await fetch(
            `./api/schedules/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!response.ok) {

        let message =
            "予定の削除に失敗しました。";


        try {

            const error =
                await response.json();


            message =
                error.error ||
                message;

        } catch {
        }


        throw new Error(
            message
        );

    }

}