import { Server } from "socket.io";

const io = new Server({
  maxHttpBufferSize: 1e8,
  pingTimeout: 6000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(4000)
console.log("socket io is running on 4000")

io.on("connection", (socket) => {
    console.log("user connected")

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })

  socket.on("ultimateSharing", (input, inputNumber) => {
    socket.broadcast.emit("ultimateSharing", input, inputNumber);
    console.log("data recieved on server");
    console.log(input);
  });
})