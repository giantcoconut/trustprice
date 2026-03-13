import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { bot, sendPriceUpdate } from './bot';

const POLL_INTERVAL = parseInt(process.env.PRICE_POLL_INTERVAL_MS || '300000', 10);
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('Starting $TRUST Price Bot...');
console.log(`Polling interval set to ${POLL_INTERVAL}ms`);

let intervalId: NodeJS.Timeout;

// Create a dummy Express app so Render Web Service stays alive
const app = express();
app.get('/', (req, res) => {
  res.send('$TRUST Price Bot is running!');
});

async function start() {
  try {
    const botInfo = await bot.getMe();
    console.log(`Bot connected as @${botInfo.username}`);
    
    // Initial fetch and send
    await sendPriceUpdate();
    
    // Set up polling interval without duplicate creation
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    intervalId = setInterval(sendPriceUpdate, POLL_INTERVAL);

    // Start listening on the port for Render (binding to 0.0.0.0 is crucial)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Dummy web server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start bot:', (error as Error).message);
    process.exit(1);
  }
}

start();

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (intervalId) clearInterval(intervalId);
  bot.stopPolling({ cancel: true }).then(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
