const placesService = require('../services/placesService');

class PlacesController {

  // GET /api/places - Buscar todos os lugares
  async getAllPlaces(req, res) {
    try {
      const places = await placesService.getAllPlaces();
      
      res.status(200).json({
        success: true,
        count: places.length,
        data: places
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/places/:id - Buscar lugar por ID
  async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      const place = await placesService.getPlaceById(id);
      
      res.status(200).json({
        success: true,
        data: place
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/places - Criar novo lugar
  async createPlace(req, res) {
    try {
      const placeData = req.body;
      const place = await placesService.createPlace(placeData);
      
      res.status(201).json({
        success: true,
        message: 'Lugar criado com sucesso',
        data: place
      });
    } catch (error) {
      const statusCode = error.message.includes('já existe') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/places/:id - Atualizar lugar
  async updatePlace(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const place = await placesService.updatePlace(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Lugar atualizado com sucesso',
        data: place
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/places/:id/visit - Marcar como visitado
  async markAsVisited(req, res) {
    try {
      const { id } = req.params;
      const visitData = req.body;
      
      const place = await placesService.markAsVisited(id, visitData);
      
      res.status(200).json({
        success: true,
        message: 'Lugar marcado como visitado',
        data: place
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/places/:id/plan - Marcar como planejado
  async markAsPlanned(req, res) {
    try {
      const { id } = req.params;
      const plannedData = req.body;
      
      const place = await placesService.markAsPlanned(id, plannedData);
      
      res.status(200).json({
        success: true,
        message: 'Lugar marcado como planejado',
        data: place
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/places/:id - Deletar lugar
  async deletePlace(req, res) {
    try {
      const { id } = req.params;
      const result = await placesService.deletePlace(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/places/status/:status - Buscar por status
  async getPlacesByStatus(req, res) {
    try {
      const { status } = req.params;
      const places = await placesService.getPlacesByStatus(status);
      
      res.status(200).json({
        success: true,
        count: places.length,
        data: places
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/places/nearby - Buscar lugares próximos
  async getNearbyPlaces(req, res) {
    try {
      const { lat, lng, distance } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude e longitude são obrigatórios'
        });
      }

      const places = await placesService.getNearbyPlaces(
        parseFloat(lat), 
        parseFloat(lng), 
        distance ? parseInt(distance) : undefined
      );
      
      res.status(200).json({
        success: true,
        count: places.length,
        data: places
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/places/stats - Obter estatísticas
  async getStats(req, res) {
    try {
      const stats = await placesService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PlacesController();
