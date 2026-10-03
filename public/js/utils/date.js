/* ============================================================
   日付
   ============================================================ */

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


/* ============================================================
   日時
   ============================================================ */

/**
 * 日時から YYYY-MM-DD を取得する
 */
export function getDateKey(value) {
    if (!value) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (Number.isNaN(date.getTime())) {
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


/**
 * 日時から HH:MM を取得する
 */
export function formatTime(value) {
    if (!value) {
        return "";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${hours}:${minutes}`;
}


/**
 * YYYY-MM-DD を Date に変換する
 */
export function parseDateKey(dateKey) {
    if (!dateKey) {
        return null;
    }

    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/
            .exec(dateKey);

    if (!match) {
        return null;
    }

    const year =
        Number(match[1]);

    const month =
        Number(match[2]);

    const day =
        Number(match[3]);

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}