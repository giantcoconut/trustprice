import TelegramBot from 'node-telegram-bot-api';
import { getTrustPrice } from './services/priceService';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be provided in .env');
}

export const bot = new TelegramBot(token, { polling: true });

// Cache for the latest successfully fetched price
let cachedPrice: { priceUsd: string; priceChange24h: number; timestamp: number } | null = null;

/**
 * Formats the price text with an indicator emoji.
 */
function formatPriceMessage(priceUsd: string, priceChange24h: number, time: Date): string {
  const emoji = priceChange24h >= 0 ? '🟢' : '🔴';
  const timeString = time.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  
  return `*TRUST Price Update*
Price: $${priceUsd}
24h Change: ${priceChange24h}% ${emoji}
Time: ${timeString}`;
}

/**
 * Updates the cached price and sends the update to the configured chat.
 */
export async function sendPriceUpdate() {
  console.log(`[${new Date().toISOString()}] Fetching price update...`);
  const data = await getTrustPrice();

  if (data) {
    cachedPrice = {
      ...data,
      timestamp: Date.now(),
    };
    
    const message = formatPriceMessage(data.priceUsd, data.priceChange24h, new Date());
    
    try {
      await bot.sendMessage(chatId as string, message, { parse_mode: 'Markdown' });
      console.log('Price update sent successfully.');
    } catch (error) {
      console.error('Failed to send Telegram message:', (error as Error).message);
    }
  } else {
    console.error('Skipping price update due to fetch failure.');
  }
}

// Command: /start
bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot is running. I will track the $TRUST price.');
});

// Command: /help
bot.onText(/^\/help$/, (msg) => {
  const helpText = `
Available commands:
/start - Confirm the bot is running
/price - Get the latest current $TRUST price immediately
/help - Show this help message
  `;
  bot.sendMessage(msg.chat.id, helpText.trim());
});

// Command: /price
bot.onText(/^\/price$/, async (msg) => {
  bot.sendChatAction(msg.chat.id, 'typing');
  
  const data = await getTrustPrice();
  
  if (data) {
    cachedPrice = {
      ...data,
      timestamp: Date.now(),
    };
    const message = formatPriceMessage(data.priceUsd, data.priceChange24h, new Date());
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } else if (cachedPrice) {
    const cachedDate = new Date(cachedPrice.timestamp);
    const message = `*⚠️ API temporarily down*\n_Showing last known price:_\n\n` + formatPriceMessage(cachedPrice.priceUsd, cachedPrice.priceChange24h, cachedDate);
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(msg.chat.id, 'Sorry, could not fetch the price and no cached data is available.');
  }
});
