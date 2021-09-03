const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");
const socket = require("./app/server/socket");

const server = http.createServer(app);

app.use(express.static(__dirname + "/app/client"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/app/client/index.html");
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});

socket.init(server)