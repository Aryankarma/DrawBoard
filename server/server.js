// import { Server } from "socket.io";

// const io = new Server({
//   maxHttpBufferSize: 1e8,
//   pingTimeout: 6000,
//   cors: {
//     origin: "http://localhost:5173",
//   },
// });

// io.listen(4000)
// console.log("socket io is running on 4000")

// io.on("connection", (socket) => {
//   console.log("user connected")

//   socket.on("disconnect", () => {
//     console.log("user disconnected")
//   })

//   // create room

//   // join room

//   // leaving room

//   //  handling ultimateSharing when within the room
//   socket.on("ultimateSharing", (input, inputNumber) => {
//     socket.broadcast.emit("ultimateSharing", input, inputNumber);
//     console.log("data");
//   });
// })

import { Server } from "socket.io";
import crypto from "crypto";

  const io = new Server({
    maxHttpBufferSize: 1e8,
    pingTimeout: 600,
    cors: {
      origin: ["https://drawboard10.web.app", "http://localhost:5173"],
    },
  });

io.listen(process.env.PORT || 4000);
console.log("server io is running on 4000");

const rooms = new Map();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // handle create room
  socket.on("createRoom", (roomName, userName, password) => {
    if (rooms.has(roomName)) {
      socket.emit("roomError", `Room ${roomName} already exists!`);
    } else {
      console.log(roomName, userName, password);
      const hashedPassword = hashPassword(password);
      rooms.set(roomName, { userName, hashedPassword });
      socket.join(roomName);
      console.log(`room created ${roomName}`);
      socket.emit("roomCreated", `Room ${roomName} created!`);
      socket.emit(
        "roomJoined",
        `User "${userName}" joined the room "${roomName}"`,
        roomName
      );
    }
  });

  // handle join room
  socket.on("joinRoom", (roomName, userName, password) => {
    if (!rooms.has(roomName)) {
      socket.emit("roomError", `Room: ${roomName} does not exist`);
    } else {
      const hashedPassword = hashPassword(password);
      if (rooms.get(roomName).hashedPassword === hashedPassword) {
        socket.join(roomName);
        console.log(`user ${userName} joined the room ${roomName}`);
        socket.emit(
          "roomJoined",
          `User "${userName}" joined the room "${roomName}"`,
          roomName
        );
      } else {
        socket.emit("roomError", "Wrong password!");
      }
    }
  });

  // handle leaving room
  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    socket.emit("roomLeft", `you left the room: ${roomName}`);
    console.log(`left room: ${roomName}`);
  });

  // handle ultimate sharing function
  socket.on("ultimateSharing", (input, inputNumber, roomName) => {
    // just temporary fix, make sure it does not send the data to the server if the room is not created!
    if (roomName == undefined) {
      console.log("Room has not created yet!");
      return;
    }

    if (socket.rooms.has(roomName)) {
      console.log(`data has been shared to ${roomName}`);
      socket.to(roomName).emit("ultimateSharing", input, inputNumber);
    }
    // else {
    //   socket.emit("roomError", "you are not in this room");
    // }
  });
});
