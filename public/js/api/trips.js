const API_BASE = "./api";

async function parseError(response, defaultMessage) {
    try {
        const error = await response.json();

        return error.error || defaultMessage;
    } catch {
        return defaultMessage;
    }
}

export async function getTrips() {
    const response =
        await fetch(`${API_BASE}/trips`);

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
                "旅行一覧の取得に失敗しました"
            )
        );
    }

    return response.json();
}

export async function getTrip(id) {
    const response =
        await fetch(`${API_BASE}/trips/${id}`);

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
                "旅行の取得に失敗しました"
            )
        );
    }

    return response.json();
}

export async function createTrip(data) {
    const response =
        await fetch(`${API_BASE}/trips`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
                "旅行の作成に失敗しました"
            )
        );
    }

    return response.json();
}

export async function updateTrip(id, data) {
    const response =
        await fetch(`${API_BASE}/trips/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
                "旅行の更新に失敗しました"
            )
        );
    }

    return response.json();
}

export async function deleteTrip(id) {
    const response =
        await fetch(`${API_BASE}/trips/${id}`, {
            method: "DELETE"
        });

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
                "旅行の削除に失敗しました"
            )
        );
    }
}