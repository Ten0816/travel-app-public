export async function getEvents(tripId) {

    const response =
        await fetch(
            `./api/trips/${tripId}/events`
        );


    if (!response.ok) {
        throw new Error(
            "候補イベントを取得できませんでした。"
        );
    }


    return response.json();
}


export async function createEvent(tripId, data) {

    const response =
        await fetch(
            `./api/trips/${tripId}/events`,
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
            "候補イベントの作成に失敗しました。";


        try {

            const error =
                await response.json();

            message =
                error.error || message;

        } catch {
        }


        throw new Error(message);
    }


    return response.json();
}


export async function updateEvent(id, data) {

    const response =
        await fetch(
            `./api/events/${id}`,
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
            "候補イベントの更新に失敗しました。";


        try {

            const error =
                await response.json();

            message =
                error.error || message;

        } catch {
        }


        throw new Error(message);
    }


    return response.json();
}


export async function deleteEvent(id) {

    const response =
        await fetch(
            `./api/events/${id}`,
            {
                method: "DELETE"
            }
        );


    if (!response.ok) {

        let message =
            "候補イベントの削除に失敗しました。";


        try {

            const error =
                await response.json();

            message =
                error.error || message;

        } catch {
        }


        throw new Error(message);
    }
}