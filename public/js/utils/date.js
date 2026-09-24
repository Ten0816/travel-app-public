export function formatPeriod(startDate, endDate) {
    if (!startDate && !endDate) {
        return "";
    }

    if (startDate && endDate) {
        return `${formatDate(startDate)} ～ ${formatDate(endDate)}`;
    }

    if (startDate) {
        return `${formatDate(startDate)} ～`;
    }

    return `～ ${formatDate(endDate)}`;
}

export function formatDate(value) {
    if (!value) {
        return "";
    }

    const date =
        new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "ja-JP",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}