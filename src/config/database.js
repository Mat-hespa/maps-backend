const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // URL de conexão do MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }
    
    // Opções de conexão
    const options = {
      maxPoolSize: 10, // Máximo de 10 conexões simultâneas
      serverSelectionTimeoutMS: 5000, // Timeout após 5s
      socketTimeoutMS: 45000, // Timeout de socket após 45s
      bufferCommands: false // Disable mongoose buffering
    };

    // Conectar ao MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Event listeners para monitorar a conexão
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose conectado ao MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão do MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose desconectado do MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Conexão do MongoDB fechada devido ao encerramento da aplicação');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar com o MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
