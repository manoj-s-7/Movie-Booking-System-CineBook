const router = require("express").Router();
const {
  getNowPlaying, getPopular, getUpcoming, getTopRated,
  getMovieDetails, searchMovies, getGenres, getShowtimes
} = require("../controllers/movieController");

router.get("/now-playing", getNowPlaying);
router.get("/popular", getPopular);
router.get("/upcoming", getUpcoming);
router.get("/top-rated", getTopRated);
router.get("/genres", getGenres);
router.get("/search", searchMovies);
router.get("/:tmdbId/details", getMovieDetails);
router.get("/:tmdbId/showtimes", getShowtimes);

module.exports = router;
