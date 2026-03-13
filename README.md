# TRUST Price Telegram Bot

A minimal, production-friendly Telegram bot built with Node.js and TypeScript that polls the live price of Intuition ($TRUST) on Base every 5 minutes and posts updates to a specific Telegram chat.

## Features
- Fetches real-time price data using DexScreener API
- Automatically sends a price update message every 5 minutes
- Includes 24-hour price change and an up/down indicator emoji (🟢/🔴)
- Caches the last successful price so `/price` command works even if the API is temporarily down
- Graceful shutdown support for safe scaling or exiting
- In-memory processing with no database required

## Available Commands
- `/start` - Confirms the bot is running
- `/price` - Returns the latest current $TRUST price immediately
- `/help` - Shows available commands
