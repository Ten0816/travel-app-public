import {
    tripModal,
    tripModalTitle,
    tripForm,
    tripNameInput,
    tripStartDateInput,
    tripEndDateInput,
    tripDescriptionInput
} from "../dom.js";

import {
    createTrip,
    updateTrip
} from "../api/trips.js";

import {
    getCurrentTrip,
    setCurrentTrip,
    getEditingTripId,
    setEditingTripId
} from "../state.js";

import {
    loadTrips
} from "../trip/tripList.js";

import {
    openTripDetail,
    renderTripDetail
} from "../trip/tripDetail.js";

export function openCreateTripModal() {
    setEditingTripId(null);

    tripModalTitle.textContent =
        "新しい旅行";

    tripForm.reset();

    tripModal.classList.remove("hidden");

    tripNameInput.focus();
}

export function openEditTripModal() {
    const currentTrip =
        getCurrentTrip();

    if (!currentTrip) {
        return;
    }

    setEditingTripId(
        currentTrip.id
    );

    tripModalTitle.textContent =
        "旅行を編集";

    tripNameInput.value =
        currentTrip.name || "";

    tripStartDateInput.value =
        currentTrip.start_date || "";

    tripEndDateInput.value =
        currentTrip.end_date || "";

    tripDescriptionInput.value =
        currentTrip.description || "";

    tripModal.classList.remove("hidden");

    tripNameInput.focus();
}

export function closeTripModal() {
    tripModal.classList.add("hidden");

    setEditingTripId(null);

    tripForm.reset();
}

async function handleSubmit(event) {
    event.preventDefault();

    const data = {
        name: tripNameInput.value,
        start_date: tripStartDateInput.value,
        end_date: tripEndDateInput.value,
        description: tripDescriptionInput.value
    };

    try {
        const editingTripId =
            getEditingTripId();

        if (editingTripId === null) {
            const trip =
                await createTrip(data);

            closeTripModal();

            await openTripDetail(
                trip.id
            );

        } else {
            const trip =
                await updateTrip(
                    editingTripId,
                    data
                );

            closeTripModal();

            setCurrentTrip(trip);

            renderTripDetail(trip);

            await loadTrips();
        }

    } catch (error) {
        console.error(error);

        alert(error.message);
    }
}

export function initializeTripModal() {
    tripForm.addEventListener(
        "submit",
        handleSubmit
    );
}