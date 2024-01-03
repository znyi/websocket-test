const WebSocket = require("ws");

const port = 8082;

const wss = new WebSocket.Server({ port: port }, () => {
  console.log(`WebSocket server is listening on port ${port}`)
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    console.log(`Client says : ${data}`);

    ws.send(`Server says : ${data}`)
  });

  ws.on("close", () => {
    console.log("Client has disconnected!");
  });
});
