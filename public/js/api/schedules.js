export async function getSchedules(tripId) {
    const response = await fetch(
        `./api/trips/${tripId}/schedules`
    );

    if (!response.ok) {
        throw new Error(
            "予定情報を取得できませんでした。"
        );
    }

    return response.json();
}