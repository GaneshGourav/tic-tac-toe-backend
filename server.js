// server.js (Node.js with Express and WebSocket)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameBoard = Array(9).fill(null);
let currentPlayer = 'X';

wss.on('connection', (ws) => {
  // Send initial game state to the new player
  ws.send(JSON.stringify({ type: 'init', board: gameBoard }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      // Update game state
      const { index } = data;
      if (!gameBoard[index] && currentPlayer === data.player) {
        gameBoard[index] = currentPlayer;
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        // Broadcast updated game state to all players
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', board: gameBoard }));
          }
        });
      }
    }
  });
});

server.listen(8080, () => {
  console.log('Server started on port 8080');
});
