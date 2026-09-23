async function loadTrips() {
    const tripList = document.getElementById("trip-list");

    try {
        const response = await fetch("/api/trips");

        if (!response.ok) {
            throw new Error("旅行情報の取得に失敗しました");
        }

        const trips = await response.json();

        if (trips.length === 0) {
            tripList.textContent = "旅行がありません。";
            return;
        }

        tripList.innerHTML = trips
            .map(trip => `
                <article>
                    <h3>${escapeHtml(trip.name)}</h3>
                    <p>
                        ${escapeHtml(trip.start_date || "")}
                        〜
                        ${escapeHtml(trip.end_date || "")}
                    </p>
                </article>
            `)
            .join("");

    } catch (error) {
        console.error(error);
        tripList.textContent =
            "旅行情報の読み込みに失敗しました。";
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadTrips();
