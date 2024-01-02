const WebSocket = require("ws");

const port = 8082;

const wss = new WebSocket.Server({ port: port }, () => {
  console.log(`WebSocket server is listening on port ${port}`)
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    console.log(`Client has sent us : ${data}`);

    ws.send(`I am good!`)
  });

  ws.on("close", () => {
    console.log("Client has disconnected!");
  });
});
