// Strategy engine for Binary Signal Logger

export interface PriceBar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryTime: Date;
  entryPrice: number;
  exitTime: Date;
  exitPrice: number;
  result: 'WIN' | 'LOSS';
  profit: number;
}

// Simple RSI calculation
function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i-1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi.push(100 - (100 / (1 + (avgGain / avgLoss || 0.0001))));

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i-1];
    const currentGain = Math.max(change, 0);
    const currentLoss = Math.abs(Math.min(change, 0));

    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

// Detect support and resistance using recent pivots
function detectSupportResistance(bars: PriceBar[], lookback: number = 20) {
  const highs = bars.slice(-lookback).map(b => b.high);
  const lows = bars.slice(-lookback).map(b => b.low);

  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  return { support, resistance };
}

// Simple bullish reversal simulation
function isBullishReversal(bars: PriceBar[]): boolean {
  const last3 = bars.slice(-3);
  if (last3.length < 3) return false;
  // Hammer-like or engulfing simulation
  return last3[2].close > last3[1].close && last3[1].close > last3[0].close;
}

function isBearishReversal(bars: PriceBar[]): boolean {
  const last3 = bars.slice(-3);
  if (last3.length < 3) return false;
  return last3[2].close < last3[1].close && last3[1].close < last3[0].close;
}

export function generateMockPrice(pair: string): PriceBar {
  const basePrice = pair.includes('JPY') ? 150 : 1.08;
  const volatility = 0.0008;

  return {
    timestamp: new Date(),
    open: basePrice + (Math.random() - 0.5) * 0.005,
    high: basePrice + (Math.random() - 0.5) * 0.008 + 0.001,
    low: basePrice + (Math.random() - 0.5) * 0.008 - 0.001,
    close: basePrice + (Math.random() - 0.5) * 0.005
  };
}

export function detectSignal(bars: PriceBar[], pair: string) {
  if (bars.length < 20) return null;

  const closes = bars.map(b => b.close);
  const rsiValues = calculateRSI(closes);
  const currentRSI = rsiValues[rsiValues.length - 1];
  const { support, resistance } = detectSupportResistance(bars);
  const currentPrice = bars[bars.length - 1].close;

  const nearSupport = Math.abs(currentPrice - support) / support < 0.003;
  const nearResistance = Math.abs(currentPrice - resistance) / resistance < 0.003;

  if (nearSupport && currentRSI <= 30 && isBullishReversal(bars)) {
    return { type: 'BUY' as const, price: currentPrice };
  }

  if (nearResistance && currentRSI >= 70 && isBearishReversal(bars)) {
    return { type: 'SELL' as const, price: currentPrice };
  }

  return null;
}