const express = require("express");
const path = require("path");

const tripRoutes = require("./routes/trips");
const scheduleRoutes =
    require("./routes/schedules");

const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));


/* ============================================================
   Health
   ============================================================ */

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        app: "travel-app"
    });
});


app.use("/api/trips", tripRoutes);



/* ============================================================
   Schedules
   ============================================================ */

app.use("/api", scheduleRoutes);


/* ============================================================
   Server
   ============================================================ */

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Travel App listening on port ${PORT}`);
});