const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateCreatePlace,
  validateUpdatePlace,
  validateMarkAsVisited,
  validateMarkAsPlanned,
  validateIdParam,
  validateStatusParam
} = require('../middleware/validation');

// @route   GET /api/places
// @desc    Buscar todos os lugares
// @access  Public
router.get('/', asyncHandler(placesController.getAllPlaces));

// @route   GET /api/places/stats
// @desc    Obter estatísticas dos lugares
// @access  Public
router.get('/stats', asyncHandler(placesController.getStats));

// @route   GET /api/places/nearby
// @desc    Buscar lugares próximos
// @access  Public
// @query   lat, lng, distance (opcional)
router.get('/nearby', asyncHandler(placesController.getNearbyPlaces));

// @route   GET /api/places/status/:status
// @desc    Buscar lugares por status (planned/visited)
// @access  Public
router.get('/status/:status', 
  validateStatusParam,
  asyncHandler(placesController.getPlacesByStatus)
);

// @route   GET /api/places/:id
// @desc    Buscar lugar por ID
// @access  Public
router.get('/:id', 
  validateIdParam,
  asyncHandler(placesController.getPlaceById)
);

// @route   POST /api/places
// @desc    Criar novo lugar
// @access  Public
router.post('/', 
  validateCreatePlace,
  asyncHandler(placesController.createPlace)
);

// @route   PUT /api/places/:id
// @desc    Atualizar lugar completo
// @access  Public
router.put('/:id', 
  validateIdParam,
  validateUpdatePlace,
  asyncHandler(placesController.updatePlace)
);

// @route   PATCH /api/places/:id/visit
// @desc    Marcar lugar como visitado
// @access  Public
router.patch('/:id/visit', 
  validateIdParam,
  validateMarkAsVisited,
  asyncHandler(placesController.markAsVisited)
);

// @route   PATCH /api/places/:id/plan
// @desc    Marcar lugar como planejado
// @access  Public
router.patch('/:id/plan', 
  validateIdParam,
  validateMarkAsPlanned,
  asyncHandler(placesController.markAsPlanned)
);

// @route   DELETE /api/places/:id
// @desc    Deletar lugar
// @access  Public
router.delete('/:id', 
  validateIdParam,
  asyncHandler(placesController.deletePlace)
);

module.exports = router;
