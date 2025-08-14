const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler, notFound, requestLogger } = require('./middleware/errorHandler');
const placesRoutes = require('./routes/places');

// Conectar ao banco de dados
connectDB();

// Criar aplicação Express
const app = express();

// Middlewares de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Permitir requisições do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting - Limitar requisições por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP a cada 15 minutos
  message: {
    success: false,
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz - redireciona para a documentação da API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bem-vindo à API do Map App - Lugares Especiais',
    version: '1.0.0',
    endpoints: {
      api: '/api',
      places: '/api/places',
      health: '/health'
    },
    frontend: process.env.FRONTEND_URL || 'Frontend não configurado',
    documentation: 'Acesse /api para mais informações'
  });
});

// Rotas da API
app.use('/api/places', placesRoutes);

// Rota para informações da API
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API do Map App - Lugares Especiais',
    version: '1.0.0',
    endpoints: {
      places: '/api/places',
      health: '/health'
    },
    documentation: 'https://github.com/your-repo/api-docs'
  });
});

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-app-name.onrender.com'}` 
    : `http://localhost:${PORT}`;
  
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: ${baseUrl}/health`);
  console.log(`🗺️  API: ${baseUrl}/api`);
  console.log(`📊 Lugares: ${baseUrl}/api/places`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido');
  server.close(() => {
    console.log('🔚 Processo finalizado');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido');
  server.close(() => {
    console.log('🔚 Processo finalizado');
  });
});

module.exports = app;
