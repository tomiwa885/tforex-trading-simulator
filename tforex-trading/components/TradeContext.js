import React, { createContext, useState, useContext } from 'react';

const TradeContext = createContext();

export function TradeProvider({ children }) {
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [userProfile] = useState({
    username: 'SharkTrader_01',
    email: 'demo@tforex.com',
    accountTier: 'Premium Demo Tier',
  });

  const openPosition = (pairSymbol, entryPrice, marginAmount, direction, leverageMultiplier) => {
    if (marginAmount > balance) return false;
    setBalance((prev) => prev - marginAmount);

    const newPosition = {
      id: Math.random().toString(36).substring(7),
      pair: pairSymbol,
      entryPrice: entryPrice,
      margin: marginAmount,
      direction: direction,
      leverage: leverageMultiplier,
      time: new Date().toLocaleTimeString(),
      pnl: 0,
    };

    setPositions((prev) => [newPosition, ...prev]);
    return true;
  };

  const closePosition = (positionId) => {
    const positionToClose = positions.find((pos) => pos.id === positionId);
    if (!positionToClose) return;

    const finalPayout = positionToClose.margin + positionToClose.pnl;
    setBalance((prev) => prev + finalPayout);
    setTradeHistory((prev) => [{ ...positionToClose, closeTime: new Date().toLocaleTimeString() }, ...prev]);
    setPositions((prev) => prev.filter((pos) => pos.id !== positionId));
  };

  return (
    <TradeContext.Provider value={{ userProfile, balance, positions, setPositions, tradeHistory, openPosition, closePosition }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  return useContext(TradeContext);
}