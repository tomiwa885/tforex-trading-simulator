# tforex-trading-simulator
A high-fidelity mobile forex trading simulator prototype built with React Native and Expo.

This repository contains the source code for a mobile foreign exchange trading simulator. The goal of this project was to build a clean, functional frontend using React Native that models how an institutional trading terminal handles live data streams, user states, and quick order execution. 

It uses a dark-mode user interface designed to mimic real-world financial software while keeping performance smooth on mobile screens.

## Core Features

* **User Authentication:** A clean login gateway that captures user profiles and sets up their customized demo trading session.
* **Global State Management:** Uses the React Context API to pass data across screens seamlessly. This keeps your account equity, open trade metrics, and profile details updating in sync without sluggish loading.
* **Live Price Simulation:** Built-in background timers that constantly calculate slight price fluctuations for major currency pairs like EUR/USD, GBP/USD, and USD/JPY to simulate a live market tape.
* **Instant Trade Execution:** Allows you to place instant Buy/Long or Sell/Short orders with automatic validation blocks to prevent trading more capital than your available equity.
* **Real-Time Portfolio Tracking:** A dedicated ledger area that runs continuous arithmetic calculations to update your open positions' floating profits and losses on every price tick, with options to completely liquidate individual positions.

## Tech Stack & Architecture

* **Framework:** React Native with Expo (v51)
* **Language:** JavaScript (ES6+)
* **State & Flow:** React Context Hooks for state, and React Navigation for handling the native stack and bottom tab views.
* **Styling:** Dynamic StyleSheet architecture optimized for native mobile layouts.

## System Architecture

The application operates as a unified client-side system:
1. The user logs through the authentication gateway, initializing the Global Trade Provider.
2. The Global Context acts as a single source of truth, broadcasting account equity balances and running order datasets to the rest of the app.
3. The Navigation Controller routes this data into three active modules: the real-time Asset Watchlist, the Trade Execution Screen, and the Portfolio Ledger where active trades are processed and closed out.

## Local Installation & Setup

If you want to run this project on your machine using your own local environment, here are the steps:

1. Clone the repository:
```bash
   git clone [https://github.com/YOUR_GITHUB_USERNAME/tforex-trading-simulator.git](https://github.com/YOUR_GITHUB_USERNAME/tforex-trading-simulator.git)
