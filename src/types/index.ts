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

export interface Signal {
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  time: Date;
  rsi: number;
  support?: number;
  resistance?: number;
}