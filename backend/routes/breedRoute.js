const express = require('express');
const { getAllBreeds, createBreed, updateBreed, deleteBreed } = require('../controllers/breedController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/breeds', getAllBreeds);
router.post('/admin/breeds', isAuthenticatedUser, authorizeRoles('admin'), createBreed);
router.put('/admin/breeds/:id', isAuthenticatedUser, authorizeRoles('admin'), updateBreed);
router.delete('/admin/breeds/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteBreed);

module.exports = router;
