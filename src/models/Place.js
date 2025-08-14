const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  image: {
    type: String,
    required: true,
    default: 'assets/praia.jpg'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -90 && v[0] <= 90 &&    // latitude
               v[1] >= -180 && v[1] <= 180;    // longitude
      },
      message: 'Coordinates must be [latitude, longitude] with valid ranges'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['planned', 'visited'],
    default: 'planned'
  },
  plannedDate: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'PlannedDate must be in YYYY-MM-DD format'
    }
  },
  visitDate: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'VisitDate must be in YYYY-MM-DD format'
    }
  },
  visitDescription: {
    type: String,
    trim: true,
    maxLength: 1000
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  versionKey: false // Remove o campo __v
});

// Índices para melhor performance
placeSchema.index({ status: 1 });
placeSchema.index({ name: 'text', description: 'text' });
placeSchema.index({ coordinates: '2dsphere' }); // Para queries geoespaciais futuras

// Middleware para garantir que apenas um dos campos de data seja preenchido
placeSchema.pre('save', function(next) {
  if (this.status === 'planned') {
    this.visitDate = undefined;
    this.visitDescription = undefined;
  } else if (this.status === 'visited') {
    this.plannedDate = undefined;
  }
  next();
});

// Virtual para obter coordenadas como objeto
placeSchema.virtual('location').get(function() {
  return {
    latitude: this.coordinates[0],
    longitude: this.coordinates[1]
  };
});

// Método para converter para JSON limpo
placeSchema.methods.toJSON = function() {
  const place = this.toObject();
  delete place._id;
  delete place.createdAt;
  delete place.updatedAt;
  return place;
};

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
