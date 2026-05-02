const router = require("express").Router();
const { getSeats, createBooking, getUserBookings, cancelBooking } = require("../controllers/bookingController");
const auth = require("../middleware/auth");

router.get("/seats/:showtimeId", getSeats);
router.post("/", auth, createBooking);
router.get("/my", auth, getUserBookings);
router.patch("/:id/cancel", auth, cancelBooking);

module.exports = router;
