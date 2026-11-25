const express = require('express');
const { getMyFavourites, toggleFavourite, checkFavourite } = require('../controllers/favouriteController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/my/favourites', isAuthenticatedUser, getMyFavourites);
router.post('/favourites/toggle', isAuthenticatedUser, toggleFavourite);
router.get('/favourites/:listingId/check', isAuthenticatedUser, checkFavourite);

module.exports = router;
