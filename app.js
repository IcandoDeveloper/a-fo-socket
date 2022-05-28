const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { sequelize } = require("./models");
const cors = require("cors");
const auth = require("./routes/auth");

// sequelize 연결
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(cors());
app.use("/oauth", [auth]);
const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "http://localhost:3001",
  },
});

// 목적: A와 B가 있을때,
// 1. B-->A DM을 보낸다.[ B는 RoomId(A_B)라는 채팅방을 만들고 입장한다. -->  B-->A DM을 보낸다.(대화내용을 DB에 저장) ]
// 2. A는 상단에 메세지버튼을 누르면 RoomId(A_B)가지고 있는 채팅방 목록이 뜬다.
// 3. A가 Room을 누르면 RoomId(A_B)라는 채팅방에 입장을 한다. [ A가 RoomId(A_B)에 입장한다. --> 대화내용을 DB에서 불러온다. ]

io.on("connection", (socket) => {
  // social = { "socketId" : `${socket.id}`,
  //            "socialId" : "220867975"
  //          }

  console.log(`user connected: ${socket.id}`);

  // ## 1번 Room 입장 이벤트 처리
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`user ID: ${socket.id} joined room: ${roomId}`); // roomId = {"2208267975_2208267975"}
  });

  // ## 2번 특정 Room에 메세지 전송 이벤트 처리
  socket.on("send_message", (data) => {
    // data = {room : "2208267975_2208267975", author: "윤지", message: "d", time: "16:46" }
    socket.to(data.room).emit("receive_message", data);

    DM.create(); // 대화내용을 DB에 저장

    console.log("이게 메세지 일까요??", data);
  });

  // Socket 연결 끊기 이벤트 처리
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  // Room 나갈때 해당 Room안에 Socket에게 안내메세지 전송하기
  socket.on("leave-room", (roomId, done) => {
    socket.leave(roomId);
    done();
    console.log(`user ${socket.id}has left the room`);

    io.to(roomId).emit("remove-room", `user ${socket.id}has left the room`);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
