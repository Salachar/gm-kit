const electron = require('electron');
const WebSocket = require("ws");
const os = require('os');

class WebSocketManager {
  constructor () {
    this.wss = new WebSocket.Server({
      port: 9001,
    });

    this.setupEvents();

    const ip = this.getLocalIP();
    console.log(`📡 WebSocket server listening at ws://${ip}:9001`);
  }

  getLocalIP () {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }

  setupEvents () {
    this.wss.on("connection", (ws) => {
      console.log("New client connected");

      ws.send(JSON.stringify({ type: "init", data: "Connected to mirror" }));
    });

    this.wss.on("close", () => {
      console.log("Client disconnected");
    });
  }

  broadcast (data) {
    console.log(data);
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.warn("Failed to send to client:", err);
        }
      }
    });
  }

}

module.exports = new WebSocketManager();
