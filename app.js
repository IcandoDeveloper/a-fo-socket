const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
});

io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`user ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("leave-room", (roomName, done) => {
    socket.leave(roomName);
    done();
    console.log("나 나갔어");

    io.emit("remove-room", roomName);
    console.log("방 삭제되었음");
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
