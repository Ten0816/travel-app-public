let currentTrip = null;
let editingTripId = null;

export function getCurrentTrip() {
    return currentTrip;
}

export function setCurrentTrip(trip) {
    currentTrip = trip;
}

export function getEditingTripId() {
    return editingTripId;
}

export function setEditingTripId(id) {
    editingTripId = id;
}