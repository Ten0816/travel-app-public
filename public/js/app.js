import {
    createTripButton,
    backToTripListButton,
    editTripButton,
    deleteTripButton,
    closeTripModalButton,
    cancelTripButton,
    tripModal
} from "./dom.js";

import {
    loadTrips,
    setTripSelectHandler
} from "./trip/tripList.js";

import {
    openTripDetail,
    showTripList,
    handleDeleteTrip
} from "./trip/tripDetail.js";

import {
    openCreateTripModal,
    openEditTripModal,
    closeTripModal,
    initializeTripModal
} from "./modal/tripModal.js";


/* ============================================================
   Initialization
   ============================================================ */

setTripSelectHandler(
    openTripDetail
);

initializeTripModal();


/* ============================================================
   Event
   ============================================================ */

createTripButton.addEventListener(
    "click",
    openCreateTripModal
);

backToTripListButton.addEventListener(
    "click",
    showTripList
);

editTripButton.addEventListener(
    "click",
    openEditTripModal
);

deleteTripButton.addEventListener(
    "click",
    handleDeleteTrip
);

closeTripModalButton.addEventListener(
    "click",
    closeTripModal
);

cancelTripButton.addEventListener(
    "click",
    closeTripModal
);

tripModal
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        closeTripModal
    );


/* ============================================================
   Initial Load
   ============================================================ */

loadTrips();