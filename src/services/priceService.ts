import axios from 'axios';

// The Intuition (TRUST) token on Base
const TOKEN_ADDRESS = '0x6cd905dF2Ed214b22e0d48FF17CD4200C1C6d8A3';
const DEXSCREENER_API_URL = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`;

export interface PriceData {
  priceUsd: string;
  priceChange24h: number;
}

/**
 * Fetches the latest $TRUST price from DexScreener.
 * @returns PriceData or null if fetching fails.
 */
export async function getTrustPrice(): Promise<PriceData | null> {
  try {
    const response = await axios.get(DEXSCREENER_API_URL, { timeout: 10000 });
    
    // DexScreener returns pairs matching the token.
    // We get the first pair (usually the most liquid)
    const pairs = response.data?.pairs;
    if (!pairs || pairs.length === 0) {
      throw new Error('No pairs found for TRUST token');
    }

    const mainPair = pairs[0];
    
    return {
      priceUsd: mainPair.priceUsd,
      priceChange24h: mainPair.priceChange?.h24 || 0,
    };
  } catch (error) {
    console.error('Error fetching TRUST price:', (error as Error).message);
    return null;
  }
}
