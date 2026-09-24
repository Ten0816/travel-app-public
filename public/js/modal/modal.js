const modal = document.querySelector(
    "#common-modal"
);

const titleElement = document.querySelector(
    "#common-modal-title"
);

const messageElement = document.querySelector(
    "#common-modal-message"
);

const actionsElement = document.querySelector(
    "#common-modal-actions"
);

const closeButton = document.querySelector(
    "#common-modal-close-button"
);

let currentResolve = null;


function openModal() {
    modal.classList.remove("hidden");

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(result = false) {
    modal.classList.add("hidden");

    document.body.classList.remove(
        "modal-open"
    );

    if (currentResolve) {
        const resolve =
            currentResolve;

        currentResolve = null;

        resolve(result);
    }
}


function setMessage(message) {
    messageElement.textContent =
        message;
}


/**
 * お知らせを表示する
 *
 * @param {string} message
 * @param {string} title
 * @returns {Promise<void>}
 */
export function showAlert(
    message,
    title = "お知らせ"
) {
    return new Promise((resolve) => {
        currentResolve = resolve;

        titleElement.textContent =
            title;

        setMessage(message);

        actionsElement.innerHTML = "";

        const okButton =
            document.createElement("button");

        okButton.type = "button";
        okButton.className =
            "primary-button";
        okButton.textContent = "OK";

        okButton.addEventListener(
            "click",
            () => {
                closeModal();
            }
        );

        actionsElement.appendChild(
            okButton
        );

        openModal();

        okButton.focus();
    });
}


/**
 * 確認を表示する
 *
 * @param {string} message
 * @param {string} detail
 * @param {string} title
 * @returns {Promise<boolean>}
 */
export function showConfirm(
    message,
    detail = "",
    title = "確認"
) {
    return new Promise((resolve) => {
        currentResolve = resolve;

        titleElement.textContent =
            title;

        messageElement.innerHTML = "";

        const messageText =
            document.createElement("p");

        messageText.textContent =
            message;

        messageElement.appendChild(
            messageText
        );

        if (detail) {
            const detailText =
                document.createElement("p");

            detailText.className =
                "modal-detail";

            detailText.textContent =
                detail;

            messageElement.appendChild(
                detailText
            );
        }

        actionsElement.innerHTML = "";

        const cancelButton =
            document.createElement("button");

        cancelButton.type = "button";
        cancelButton.className =
            "secondary-button";
        cancelButton.textContent =
            "キャンセル";

        cancelButton.addEventListener(
            "click",
            () => {
                closeModal(false);
            }
        );

        const confirmButton =
            document.createElement("button");

        confirmButton.type = "button";
        confirmButton.className =
            "danger-button";
        confirmButton.textContent =
            "実行";

        confirmButton.addEventListener(
            "click",
            () => {
                closeModal(true);
            }
        );

        actionsElement.appendChild(
            cancelButton
        );

        actionsElement.appendChild(
            confirmButton
        );

        openModal();

        cancelButton.focus();
    });
}


closeButton.addEventListener(
    "click",
    () => {
        closeModal(false);
    }
);


modal
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        () => {
            closeModal(false);
        }
    );


document.addEventListener(
    "keydown",
    (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            modal.classList.contains(
                "hidden"
            )
        ) {
            return;
        }

        closeModal(false);
    }
);