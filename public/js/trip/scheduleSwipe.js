import {
    scheduleCalendar,
    scheduleList
} from "../dom.js";


const scheduleLayout =
    document.querySelector(
        ".schedule-layout"
    );


const scheduleSection =
    document.querySelector(
        ".trip-schedule-section"
    );


const scheduleLayoutWrapper =
    document.querySelector(
        ".schedule-layout-wrapper"
    );


if (
    scheduleLayout &&
    scheduleSection &&
    scheduleLayoutWrapper &&
    scheduleCalendar &&
    scheduleList
) {

    let startX = 0;

    let currentX = 0;

    let isDragging = false;

    let showingScheduleList = false;


    /* ========================================================
       スマホ判定
       ======================================================== */

    function isMobile() {

        return window.innerWidth <= 600;
    }


    /* ========================================================
       高さ調整
       ======================================================== */

    function updateWrapperHeight() {

        if (!isMobile()) {

            scheduleLayoutWrapper.style.height = "";

            return;
        }


        if (showingScheduleList) {

            scheduleLayoutWrapper.style.height =
                `${scheduleList.scrollHeight}px`;

        } else {

            scheduleLayoutWrapper.style.height =
                `${scheduleCalendar.offsetHeight}px`;
        }
    }


    /* ========================================================
       カレンダー表示
       ======================================================== */

    function showCalendar() {

        showingScheduleList = false;


        scheduleLayout.style.transform =
            "translateX(0)";


        updateWrapperHeight();
    }


    /* ========================================================
       予定一覧表示
       ======================================================== */

    function showScheduleList() {

        showingScheduleList = true;


        scheduleLayout.style.transform =
            "translateX(-100%)";


        updateWrapperHeight();
    }


    /* ========================================================
       Touch Start
       ======================================================== */

    scheduleSection.addEventListener(
        "touchstart",
        event => {

            // スマホ以外ではフリックしない
            if (!isMobile()) {
                return;
            }


            if (
                event.touches.length !== 1
            ) {
                return;
            }


            startX =
                event.touches[0].clientX;

            currentX =
                startX;

            isDragging = true;
        },
        {
            passive: true
        }
    );


    /* ========================================================
       Touch Move
       ======================================================== */

    scheduleSection.addEventListener(
        "touchmove",
        event => {

            // スマホ以外ではフリックしない
            if (!isMobile()) {
                return;
            }


            if (!isDragging) {
                return;
            }


            currentX =
                event.touches[0].clientX;
        },
        {
            passive: true
        }
    );


    /* ========================================================
       Touch End
       ======================================================== */

    scheduleSection.addEventListener(
        "touchend",
        () => {

            // スマホ以外ではフリックしない
            if (!isMobile()) {

                isDragging = false;

                return;
            }


            if (!isDragging) {
                return;
            }


            isDragging = false;


            const diff =
                currentX - startX;


            const threshold =
                50;


            if (
                Math.abs(diff) <
                threshold
            ) {
                return;
            }


            if (diff < 0) {

                // 左スワイプ
                // → 予定一覧

                showScheduleList();

            } else {

                // 右スワイプ
                // → カレンダー

                showCalendar();
            }
        }
    );


    /* ========================================================
       予定一覧の高さが変わった場合
       ======================================================== */

    const resizeObserver =
        new ResizeObserver(
            () => {

                if (
                    isMobile() &&
                    showingScheduleList
                ) {

                    updateWrapperHeight();
                }
            }
        );


    resizeObserver.observe(
        scheduleList
    );


    /* ========================================================
       初期状態
       ======================================================== */

    updateWrapperHeight();


    /* ========================================================
       画面サイズ変更
       ======================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!isMobile()) {

                showingScheduleList = false;

                scheduleLayout.style.transform =
                    "translateX(0)";
            }


            updateWrapperHeight();
        }
    );
}