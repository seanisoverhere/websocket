const socket = {};

const { Server } = require("socket.io");

const users = {};

socket.init = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    const displayName = socket.handshake.auth.displayName;
    if (!displayName) {
      return next(new Error("No display name"));
    }
    socket.displayName = displayName;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id} - ${socket.displayName}`);

    const newUser = { socketId: socket.id, displayName: socket.displayName };

    for (let [id, socket] of io.of("/").sockets) {
      users[socket.id] = {
        socketId: socket.id,
        displayName: socket.displayName,
      };
    }

    // send existing users to the new connected user
    io.to(socket.id).emit("ALL_USERS", users);

    // new user > send it to all the other existing users
    socket.broadcast.emit("NEW_USER_CONNECTED", newUser);

    socket.on("disconnect", () => {
      console.log(`A user disconnected: ${socket.id} - ${socket.displayName}`);
      delete users[socket.id];
      socket.broadcast.emit("USER_DISCONNECTED", socket.id);
    });

    // new message > send this message to the other clients
    socket.on("USER_NEW_MESSAGE", (messageObj) => {
      socket.broadcast.emit("USER_NEW_MESSAGE_FROM_SERVER", messageObj);
    });
  });
};

module.exports = socket;
