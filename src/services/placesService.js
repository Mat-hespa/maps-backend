const Place = require('../models/Place');

class PlacesService {
  
  // Buscar todos os lugares
  async getAllPlaces() {
    try {
      const places = await Place.find().sort({ createdAt: -1 });
      return places;
    } catch (error) {
      throw new Error(`Erro ao buscar lugares: ${error.message}`);
    }
  }

  // Buscar lugar por ID
  async getPlaceById(id) {
    try {
      const place = await Place.findOne({ id });
      if (!place) {
        throw new Error('Lugar não encontrado');
      }
      return place;
    } catch (error) {
      throw new Error(`Erro ao buscar lugar: ${error.message}`);
    }
  }

  // Criar novo lugar
  async createPlace(placeData) {
    try {
      // Gerar ID único se não fornecido
      if (!placeData.id) {
        placeData.id = 'place-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }

      // Verificar se já existe um lugar com esse ID
      const existingPlace = await Place.findOne({ id: placeData.id });
      if (existingPlace) {
        throw new Error('Já existe um lugar com este ID');
      }

      // Validar coordenadas
      if (!placeData.coordinates || placeData.coordinates.length !== 2) {
        throw new Error('Coordenadas são obrigatórias e devem conter [latitude, longitude]');
      }

      // Criar o lugar
      const place = new Place(placeData);
      const savedPlace = await place.save();
      
      return savedPlace;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Já existe um lugar com este ID');
      }
      throw new Error(`Erro ao criar lugar: ${error.message}`);
    }
  }

  // Atualizar lugar
  async updatePlace(id, updateData) {
    try {
      // Não permitir alteração do ID
      delete updateData.id;
      
      const place = await Place.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!place) {
        throw new Error('Lugar não encontrado');
      }

      return place;
    } catch (error) {
      throw new Error(`Erro ao atualizar lugar: ${error.message}`);
    }
  }

  // Marcar lugar como visitado
  async markAsVisited(id, visitData) {
    try {
      const { visitDate, visitDescription } = visitData;
      
      const place = await Place.findOneAndUpdate(
        { id },
        {
          status: 'visited',
          visitDate,
          visitDescription,
          $unset: { plannedDate: 1 } // Remove plannedDate
        },
        { new: true, runValidators: true }
      );

      if (!place) {
        throw new Error('Lugar não encontrado');
      }

      return place;
    } catch (error) {
      throw new Error(`Erro ao marcar lugar como visitado: ${error.message}`);
    }
  }

  // Marcar lugar como planejado
  async markAsPlanned(id, plannedData) {
    try {
      const { plannedDate } = plannedData;
      
      const place = await Place.findOneAndUpdate(
        { id },
        {
          status: 'planned',
          plannedDate,
          $unset: { 
            visitDate: 1,
            visitDescription: 1
          }
        },
        { new: true, runValidators: true }
      );

      if (!place) {
        throw new Error('Lugar não encontrado');
      }

      return place;
    } catch (error) {
      throw new Error(`Erro ao marcar lugar como planejado: ${error.message}`);
    }
  }

  // Deletar lugar
  async deletePlace(id) {
    try {
      const place = await Place.findOneAndDelete({ id });
      
      if (!place) {
        throw new Error('Lugar não encontrado');
      }

      return { message: 'Lugar deletado com sucesso', place };
    } catch (error) {
      throw new Error(`Erro ao deletar lugar: ${error.message}`);
    }
  }

  // Buscar lugares por status
  async getPlacesByStatus(status) {
    try {
      if (!['planned', 'visited'].includes(status)) {
        throw new Error('Status deve ser "planned" ou "visited"');
      }

      const places = await Place.find({ status }).sort({ createdAt: -1 });
      return places;
    } catch (error) {
      throw new Error(`Erro ao buscar lugares por status: ${error.message}`);
    }
  }

  // Buscar lugares próximos (para futuras funcionalidades)
  async getNearbyPlaces(latitude, longitude, maxDistance = 50000) {
    try {
      const places = await Place.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance // em metros
          }
        }
      });

      return places;
    } catch (error) {
      throw new Error(`Erro ao buscar lugares próximos: ${error.message}`);
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      const totalPlaces = await Place.countDocuments();
      const visitedPlaces = await Place.countDocuments({ status: 'visited' });
      const plannedPlaces = await Place.countDocuments({ status: 'planned' });
      
      return {
        total: totalPlaces,
        visited: visitedPlaces,
        planned: plannedPlaces,
        percentage: totalPlaces > 0 ? Math.round((visitedPlaces / totalPlaces) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }
}

module.exports = new PlacesService();
