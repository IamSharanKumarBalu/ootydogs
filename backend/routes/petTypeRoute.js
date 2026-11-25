const express = require('express');
const { getAllPetTypes, createPetType, updatePetType, deletePetType } = require('../controllers/petTypeController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/pet-types', getAllPetTypes);
router.post('/admin/pet-types', isAuthenticatedUser, authorizeRoles('admin'), createPetType);
router.put('/admin/pet-types/:id', isAuthenticatedUser, authorizeRoles('admin'), updatePetType);
router.delete('/admin/pet-types/:id', isAuthenticatedUser, authorizeRoles('admin'), deletePetType);

module.exports = router;
