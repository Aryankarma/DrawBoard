import { Server } from "socket.io";

const io = new Server({
    cors: {
        origin:"http://localhost:5173"
    }
})

io.listen(4000)
console.log("socket io is running on 4000")

io.on("connection", (socket) => {
    console.log("user connected")

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })

    socket.on("dataSharing", (inputData) => {
    //   console.log(inputData);
    //   console.log("backgroundCanvasData");
      // io.emit("dataSharing", inputData)
      socket.broadcast.emit("dataSharing", inputData);
    });
})