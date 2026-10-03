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

import "./trip/schedule/schedule.js";

import "./trip/scheduleSwipe.js";


/* ============================================================
   History
   ============================================================ */

/*
 * アプリを最初に開いた状態を
 * 「旅行一覧」として履歴に登録する。
 *
 * replaceStateなので、
 * 現在のページを増やすことはない。
 */
history.replaceState(
    {
        view: "list"
    },
    "",
    location.href
);


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
    () => {

        showTripList();

    }
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
   Browser / Android Back
   ============================================================ */

window.addEventListener(
    "popstate",
    event => {

        /*
         * 旅行一覧へ戻る履歴の場合
         */
        if (
            !event.state ||
            event.state.view === "list"
        ) {

            showTripList(false);

            return;
        }


        /*
         * 旅行詳細の履歴に戻った場合
         *
         * 基本的にはブラウザの戻るで
         * detailへ戻るケース。
         */
        if (
            event.state.view === "detail" &&
            event.state.tripId
        ) {

            openTripDetail(
                event.state.tripId,
                false
            );

        }

    }
);


/* ============================================================
   Initial Load
   ============================================================ */

loadTrips();