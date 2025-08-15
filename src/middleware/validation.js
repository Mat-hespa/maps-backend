const Joi = require('joi');

// Schema de validação para criar lugar
const createPlaceSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Nome é obrigatório',
    'string.max': 'Nome deve ter no máximo 200 caracteres'
  }),
  description: Joi.string().required().trim().max(1000).messages({
    'string.empty': 'Descrição é obrigatória',
    'string.max': 'Descrição deve ter no máximo 1000 caracteres'
  }),
  image: Joi.string().optional(),
  coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
    'array.length': 'Coordenadas devem conter exatamente 2 números [latitude, longitude]',
    'any.required': 'Coordenadas são obrigatórias'
  }),
  status: Joi.string().valid('planned', 'visited').default('planned'),
  plannedDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Data planejada deve estar no formato YYYY-MM-DD'
  }),
  visitDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Data da visita deve estar no formato YYYY-MM-DD'
  }),
  visitDescription: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Descrição da visita deve ter no máximo 1000 caracteres'
  })
});

// Schema de validação para atualizar lugar
const updatePlaceSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  image: Joi.string().optional(),
  coordinates: Joi.array().items(Joi.number()).length(2).optional(),
  status: Joi.string().valid('planned', 'visited').optional(),
  plannedDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visitDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visitDescription: Joi.string().trim().max(1000).optional()
});

// Schema para marcar como visitado
const markAsVisitedSchema = Joi.object({
  visitDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Data da visita deve estar no formato YYYY-MM-DD',
    'any.required': 'Data da visita é obrigatória'
  }),
  visitDescription: Joi.string().trim().max(1000).required().messages({
    'string.empty': 'Descrição da visita é obrigatória',
    'string.max': 'Descrição da visita deve ter no máximo 1000 caracteres'
  })
});

// Schema para marcar como planejado
const markAsPlannedSchema = Joi.object({
  plannedDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Data planejada deve estar no formato YYYY-MM-DD',
    'any.required': 'Data planejada é obrigatória'
  })
});

// Middleware de validação genérico
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true // Remove campos não definidos no schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    // Substituir req.body pelos dados validados e limpos
    req.body = value;
    next();
  };
};

// Middleware de validação para parâmetros de URL
const validateParams = (paramSchema) => {
  return (req, res, next) => {
    const { error, value } = paramSchema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        error: error.details[0].message
      });
    }

    req.params = value;
    next();
  };
};

// Schema para validar ID nos parâmetros
const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'ID é obrigatório',
    'any.required': 'ID é obrigatório'
  })
});

// Schema para validar status nos parâmetros
const statusParamSchema = Joi.object({
  status: Joi.string().valid('planned', 'visited').required().messages({
    'any.only': 'Status deve ser "planned" ou "visited"',
    'any.required': 'Status é obrigatório'
  })
});

module.exports = {
  validateCreatePlace: validate(createPlaceSchema),
  validateUpdatePlace: validate(updatePlaceSchema),
  validateMarkAsVisited: validate(markAsVisitedSchema),
  validateMarkAsPlanned: validate(markAsPlannedSchema),
  validateIdParam: validateParams(idParamSchema),
  validateStatusParam: validateParams(statusParamSchema)
};
