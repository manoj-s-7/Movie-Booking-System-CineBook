const pool = require("../config/db");

const generateRef = () => "CB" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

const getSeats = async (req, res) => {
  const { showtimeId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM seats WHERE showtime_id = ? ORDER BY row_label, seat_number",
      [showtimeId]
    );

    if (!rows.length) {
      // Auto-generate seats
      const rows_labels = ["A","B","C","D","E","F","G","H","I","J"];
      const seatsPerRow = 10;
      const insertSeats = [];
      for (let r = 0; r < rows_labels.length; r++) {
        const seatType = r < 2 ? "recliner" : r < 5 ? "premium" : "standard";
        for (let s = 1; s <= seatsPerRow; s++) {
          insertSeats.push([showtimeId, `${rows_labels[r]}${s}`, rows_labels[r], seatType, false]);
        }
      }
      await pool.query(
        "INSERT INTO seats (showtime_id, seat_number, row_label, seat_type, is_booked) VALUES ?",
        [insertSeats]
      );
      const [newSeats] = await pool.query(
        "SELECT * FROM seats WHERE showtime_id = ? ORDER BY row_label, seat_number",
        [showtimeId]
      );
      return res.json(newSeats);
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBooking = async (req, res) => {
  const { showtimeId, seats, totalAmount, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!showtimeId || !seats || !seats.length || !totalAmount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check seats are still available
    const seatNums = seats.map((s) => s.seat_number);
    const [bookedSeats] = await conn.query(
      "SELECT seat_number FROM seats WHERE showtime_id = ? AND seat_number IN (?) AND is_booked = TRUE",
      [showtimeId, seatNums]
    );
    if (bookedSeats.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: `Seats already booked: ${bookedSeats.map((s) => s.seat_number).join(", ")}` });
    }

    // Mark seats as booked
    await conn.query(
      "UPDATE seats SET is_booked = TRUE WHERE showtime_id = ? AND seat_number IN (?)",
      [showtimeId, seatNums]
    );

    // Update available_seats count
    await conn.query(
      "UPDATE showtimes SET available_seats = available_seats - ? WHERE id = ?",
      [seats.length, showtimeId]
    );

    const bookingRef = generateRef();
    const [result] = await conn.query(
      "INSERT INTO bookings (user_id, showtime_id, seats, total_amount, booking_ref, payment_method) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, showtimeId, JSON.stringify(seats), totalAmount, bookingRef, paymentMethod || "card"]
    );

    await conn.commit();

    // Fetch booking details
    const [booking] = await conn.query(
      `SELECT b.*, s.show_date, s.show_time, s.format, s.price,
              t.name AS theater_name, t.location AS theater_location,
              m.title AS movie_title, m.poster_path, m.tmdb_id
       FROM bookings b
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN theaters t ON s.theater_id = t.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json(booking[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, s.show_date, s.show_time, s.format, s.price,
              t.name AS theater_name, t.location AS theater_location,
              m.title AS movie_title, m.poster_path, m.tmdb_id, m.backdrop_path
       FROM bookings b
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN theaters t ON s.theater_id = t.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.user_id = ?
       ORDER BY b.booked_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const [booking] = await pool.query("SELECT * FROM bookings WHERE id = ? AND user_id = ?", [id, req.user.id]);
    if (!booking.length) return res.status(404).json({ error: "Booking not found" });
    if (booking[0].status === "cancelled") return res.status(400).json({ error: "Already cancelled" });

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]);

    // Free up seats
    const seats = JSON.parse(booking[0].seats);
    const seatNums = seats.map((s) => s.seat_number);
    await pool.query(
      "UPDATE seats SET is_booked = FALSE WHERE showtime_id = ? AND seat_number IN (?)",
      [booking[0].showtime_id, seatNums]
    );
    await pool.query(
      "UPDATE showtimes SET available_seats = available_seats + ? WHERE id = ?",
      [seats.length, booking[0].showtime_id]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSeats, createBooking, getUserBookings, cancelBooking };
