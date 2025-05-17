require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const { initDB } = require('./core/utils/database');
const logger = require('./core/utils/logger');

// Konfigurasi Client
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './data/sessions' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

// Inisialisasi
async function initialize() {
  try {
    await initDB();
    logger.success('Database initialized');
    
    require('./core/handlers')(client);
    logger.success('All handlers loaded');

    client.initialize();
  } catch (err) {
    logger.error('Initialization failed:', err);
    process.exit(1);
  }
}

// Event Handlers
client.on('qr', qr => {
  require('qrcode-terminal').generate(qr, { small: true });
  logger.info('Scan QR code di atas');
});

client.on('ready', () => {
  logger.success('🤖 Bot aktif!');
  console.log(`Fitur yang tersedia:
  • Auto-reply cerdas
  • Pembuatan stiker
  • Manajemen grup
  • Dan lainnya...`);
});

client.on('disconnected', reason => {
  logger.warn(`Disconnected: ${reason}`);
  initialize(); // Reconnect
});

// Start
initialize();