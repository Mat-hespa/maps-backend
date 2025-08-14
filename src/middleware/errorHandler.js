// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware de tratamento de erro global
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro para debugging
  console.error('❌ Erro:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Recurso já existe';
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware de logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    // Cor baseada no status
    let statusColor = '\x1b[32m'; // Verde para 2xx
    if (status >= 400 && status < 500) statusColor = '\x1b[33m'; // Amarelo para 4xx
    if (status >= 500) statusColor = '\x1b[31m'; // Vermelho para 5xx
    
    console.log(
      `${statusColor}${method}\x1b[0m ${url} - ${statusColor}${status}\x1b[0m - ${duration}ms`
    );
  });
  
  next();
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFound,
  requestLogger
};
