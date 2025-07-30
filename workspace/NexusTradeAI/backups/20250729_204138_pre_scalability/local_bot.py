#!/usr/bin/env python3
"""
Local Bot for ML Models
Provides real-time data and predictions for ML models in the trading dashboard
"""

import asyncio
import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import websockets
from websockets.server import serve
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading

# FastAPI app
app = FastAPI(title="Local Bot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PredictionRequest(BaseModel):
    model: str
    symbol: str
    timeframe: str = "1h"

class TrainingRequest(BaseModel):
    model: str
    parameters: Dict = {}

class CommandRequest(BaseModel):
    command: str
    parameters: Dict = {}

# Global state
connected_clients = set()
strategy_status = {
    'cumulative_delta': {'status': 'active', 'performance': {'win_rate': 78, 'pnl': '+24.8%'}},
    'liquidation_detection': {'status': 'active', 'performance': {'win_rate': 71, 'pnl': '+19.2%'}},
    'momentum_breakout': {'status': 'active', 'performance': {'win_rate': 69, 'pnl': '+16.7%'}},
    'delta_divergence': {'status': 'active', 'performance': {'win_rate': 74, 'pnl': '+21.3%'}},
    'hvn_rejection': {'status': 'active', 'performance': {'win_rate': 66, 'pnl': '+14.5%'}},
    'liquidity_absorption': {'status': 'active', 'performance': {'win_rate': 72, 'pnl': '+18.9%'}},
    'liquidity_traps': {'status': 'active', 'performance': {'win_rate': 76, 'pnl': '+22.1%'}},
    'iceberg_detection': {'status': 'active', 'performance': {'win_rate': 70, 'pnl': '+17.4%'}},
    'stop_run_anticipation': {'status': 'active', 'performance': {'win_rate': 73, 'pnl': '+20.6%'}},
    'lvn_breakout': {'status': 'active', 'performance': {'win_rate': 67, 'pnl': '+15.8%'}},
    'volume_imbalance': {'status': 'active', 'performance': {'win_rate': 71, 'pnl': '+19.7%'}}
}

model_metrics = {
    "cnn1d": {
        "accuracy": 94.2,
        "precision": 91.8,
        "recall": 89.5,
        "f1_score": 90.6,
        "status": "Active"
    },
    "lstm": {
        "accuracy": 92.7,
        "precision": 89.3,
        "recall": 91.1,
        "f1_score": 90.2,
        "status": "Active"
    },
    "transformer": {
        "accuracy": 96.1,
        "precision": 94.7,
        "recall": 93.2,
        "f1_score": 93.9,
        "status": "Active"
    },
    "catboost": {
        "accuracy": 93.4,
        "precision": 91.7,
        "recall": 92.1,
        "f1_score": 91.9,
        "status": "Active"
    },
    "lightgbm": {
        "accuracy": 92.8,
        "precision": 90.5,
        "recall": 91.3,
        "f1_score": 90.9,
        "status": "Active"
    },
    "xgboost": {
        "accuracy": 93.1,
        "precision": 91.2,
        "recall": 92.0,
        "f1_score": 91.6,
        "status": "Active"
    }
}

available_symbols = ["BTC", "ETH", "AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "NFLX", "NQ", "ES", "YM", "GC", "CL"]

# Simulated market data
def generate_market_data(symbol: str) -> Dict:
    """Generate simulated market data for a symbol"""
    base_price = {
        "BTC": 45000, "ETH": 3000, "AAPL": 150, "TSLA": 250, "GOOGL": 2800,
        "MSFT": 350, "AMZN": 3300, "NFLX": 500, "NQ": 15000, "ES": 4500,
        "YM": 35000, "GC": 2000, "CL": 80
    }.get(symbol, 100)
    
    change = random.uniform(-0.05, 0.05)
    current_price = base_price * (1 + change)
    
    return {
        "symbol": symbol,
        "price": round(current_price, 2),
        "change": round(change * 100, 2),
        "volume": random.randint(1000000, 10000000),
        "high": round(current_price * 1.02, 2),
        "low": round(current_price * 0.98, 2),
        "open": round(current_price * (1 + random.uniform(-0.01, 0.01)), 2),
        "timestamp": datetime.now().isoformat()
    }

# Simulated predictions
def generate_prediction(model: str, symbol: str) -> Dict:
    """Generate simulated prediction for a model and symbol"""
    signals = ["Bullish Signal", "Bearish Signal", "Neutral Signal", "Strong Buy", "Buy Signal", "Hold Signal", "Weak Buy"]
    signal = random.choice(signals)
    confidence = random.randint(60, 95)
    
    # Generate target based on signal
    if "Bullish" in signal or "Buy" in signal:
        target_change = random.uniform(0.5, 5.0)
        target_text = f"+{target_change:.1f}%"
    elif "Bearish" in signal:
        target_change = random.uniform(-5.0, -0.5)
        target_text = f"{target_change:.1f}%"
    else:
        target_change = random.uniform(-1.0, 1.0)
        target_text = f"{target_change:+.1f}%"
    
    return {
        "model": model,
        "symbol": symbol,
        "signal": signal,
        "confidence": confidence,
        "target": target_text,
        "timestamp": datetime.now().isoformat()
    }

# WebSocket handler
async def websocket_handler(websocket, path):
    """Handle WebSocket connections"""
    connected_clients.add(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                print(f"Received: {data}")
                
                # Handle different message types
                if data.get("type") == "subscribe":
                    # Send initial data
                    await websocket.send(json.dumps({
                        "type": "model_metrics",
                        "model": "cnn1d",
                        "accuracy": model_metrics["cnn1d"]["accuracy"],
                        "precision": model_metrics["cnn1d"]["precision"],
                        "recall": model_metrics["cnn1d"]["recall"],
                        "f1_score": model_metrics["cnn1d"]["f1_score"]
                    }))
                elif data.get("type") == "get_strategy_status":
                    # Send strategy status
                    await websocket.send(json.dumps({
                        "type": "strategy_status",
                        "strategies": [
                            {"name": strategy, "status": info["status"], "error": None}
                            for strategy, info in strategy_status.items()
                        ]
                    }))
                elif data.get("type") == "toggle_strategy":
                    # Toggle strategy status
                    strategy = data.get("strategy")
                    enabled = data.get("enabled")
                    if strategy in strategy_status:
                        strategy_status[strategy]["status"] = "active" if enabled else "inactive"
                        await broadcast({
                            "type": "strategy_status",
                            "strategies": [
                                {"name": strategy, "status": info["status"], "error": None}
                                for strategy, info in strategy_status.items()
                            ]
                        })
                    
            except json.JSONDecodeError:
                print(f"Invalid JSON: {message}")
                
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(connected_clients)}")

# Broadcast function
async def broadcast(message: Dict):
    """Broadcast message to all connected clients"""
    if connected_clients:
        message_str = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_str) for client in connected_clients],
            return_exceptions=True
        )

# Background task to simulate real-time updates
async def background_updates():
    """Send periodic updates to connected clients"""
    while True:
        try:
            # Generate random predictions for different models
            for model in ["cnn1d", "lstm", "transformer", "catboost", "lightgbm", "xgboost"]:
                symbol = random.choice(available_symbols)
                prediction = generate_prediction(model, symbol)
                
                await broadcast({
                    "type": "model_prediction",
                    "model": model,
                    "symbol": symbol,
                    "signal": prediction["signal"],
                    "confidence": prediction["confidence"],
                    "target": prediction["target"]
                })
            
            # Update metrics occasionally
            if random.random() < 0.1:  # 10% chance
                for model in model_metrics:
                    model_metrics[model]["accuracy"] += random.uniform(-0.1, 0.1)
                    model_metrics[model]["accuracy"] = max(85, min(98, model_metrics[model]["accuracy"]))
                    
                    await broadcast({
                        "type": "model_metrics",
                        "model": model,
                        "accuracy": round(model_metrics[model]["accuracy"], 1),
                        "precision": model_metrics[model]["precision"],
                        "recall": model_metrics[model]["recall"],
                        "f1_score": model_metrics[model]["f1_score"]
                    })
            
            # Update strategy performance occasionally
            if random.random() < 0.05:  # 5% chance
                strategy = random.choice(list(strategy_status.keys()))
                if strategy_status[strategy]["status"] == "active":
                    # Simulate strategy performance update
                    performance = strategy_status[strategy]["performance"]
                    performance["win_rate"] += random.uniform(-2, 2)
                    performance["win_rate"] = max(50, min(95, performance["win_rate"]))
                    
                    await broadcast({
                        "type": "strategy_performance",
                        "strategy": strategy,
                        "performance": performance
                    })
                    
                    # Occasionally simulate strategy errors
                    if random.random() < 0.02:  # 2% chance of error
                        strategy_status[strategy]["status"] = "error"
                        await broadcast({
                            "type": "strategy_error",
                            "strategy": strategy,
                            "error": f"Connection timeout for {strategy} strategy"
                        })
                    elif strategy_status[strategy]["status"] == "error" and random.random() < 0.1:
                        # 10% chance to recover from error
                        strategy_status[strategy]["status"] = "active"
                        await broadcast({
                            "type": "strategy_performance",
                            "strategy": strategy,
                            "performance": performance
                        })
            
            await asyncio.sleep(30)  # Update every 30 seconds
            
        except Exception as e:
            print(f"Error in background updates: {e}")
            await asyncio.sleep(5)

# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/symbols")
async def get_symbols():
    """Get available symbols"""
    return {"symbols": available_symbols}

@app.get("/api/market/{symbol}")
async def get_market_data(symbol: str):
    """Get market data for a symbol"""
    if symbol.upper() not in available_symbols:
        raise HTTPException(status_code=404, detail="Symbol not found")
    
    return generate_market_data(symbol.upper())

@app.post("/api/predict")
async def get_prediction(request: PredictionRequest):
    """Get prediction for a model and symbol"""
    if request.model not in model_metrics:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if request.symbol.upper() not in available_symbols:
        raise HTTPException(status_code=404, detail="Symbol not found")
    
    prediction = generate_prediction(request.model, request.symbol.upper())
    
    # Broadcast to WebSocket clients
    await broadcast({
        "type": "model_prediction",
        "model": request.model,
        "symbol": request.symbol.upper(),
        "signal": prediction["signal"],
        "confidence": prediction["confidence"],
        "target": prediction["target"]
    })
    
    return prediction

@app.get("/api/metrics/{model}")
async def get_model_metrics(model: str):
    """Get metrics for a specific model"""
    if model not in model_metrics:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return model_metrics[model]

@app.get("/api/status/{model}")
async def get_model_status(model: str):
    """Get status for a specific model"""
    if model not in model_metrics:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {
        "model": model,
        "status": model_metrics[model]["status"],
        "last_updated": datetime.now().isoformat()
    }

@app.post("/api/train")
async def train_model(request: TrainingRequest):
    """Start training for a model"""
    if request.model not in model_metrics:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Simulate training start
    print(f"Starting training for {request.model} with parameters: {request.parameters}")
    
    return {
        "model": request.model,
        "status": "training_started",
        "message": f"Training started for {request.model}",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/command")
async def send_command(request: CommandRequest):
    """Send command to the bot"""
    print(f"Received command: {request.command} with parameters: {request.parameters}")
    
    return {
        "command": request.command,
        "status": "executed",
        "message": f"Command {request.command} executed successfully",
        "timestamp": datetime.now().isoformat()
    }

# WebSocket server
async def websocket_server():
    """Start WebSocket server"""
    async with serve(websocket_handler, "localhost", 5001):
        print("WebSocket server started on ws://localhost:5001")
        await asyncio.Future()  # run forever

# Main function
async def main():
    """Main function to start both HTTP and WebSocket servers"""
    # Start background updates task
    asyncio.create_task(background_updates())
    
    # Start WebSocket server in a separate task
    asyncio.create_task(websocket_server())
    
    # Start HTTP server
    config = uvicorn.Config(app, host="0.0.0.0", port=5000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    print("Starting Local Bot...")
    print("HTTP API: http://localhost:5000")
    print("WebSocket: ws://localhost:5001")
    print("Available models:", list(model_metrics.keys()))
    print("Available symbols:", available_symbols)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down Local Bot...")
    except Exception as e:
        print(f"Error: {e}") 