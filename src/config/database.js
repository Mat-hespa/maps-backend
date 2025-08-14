const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // URL de conexão do MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }

    console.log('🔄 Tentando conectar ao MongoDB...');
    // Mascarar a senha nos logs
    const maskedURI = mongoURI.replace(/:([^:@]+)@/, ':***@');
    console.log('📍 URI (mascarada):', maskedURI);
    
    // Verificar se a URI está no formato correto
    if (!mongoURI.includes('mongodb+srv://') && !mongoURI.includes('mongodb://')) {
      throw new Error('MONGODB_URI deve começar com mongodb:// ou mongodb+srv://');
    }
    
    // Opções de conexão alinhadas com o exemplo oficial do MongoDB
    const options = {
      // Configurações do Stable API (como no exemplo oficial)
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      // Outras opções importantes
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    };

    // Conectar ao MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    // Teste de ping como no exemplo oficial
    await mongoose.connection.db.admin().ping();
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
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
