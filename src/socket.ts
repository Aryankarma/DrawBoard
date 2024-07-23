// import { io } from "socket.io-client";

// const url = "https://drawboardserverfb.onrender.com";

// export const socket = io(url,{
//     transports: ['websocket']
//   }
// );


import { io, Socket } from "socket.io-client";

const url = "https://drawboardserverfb.onrender.com";

export const socket: Socket = io(url, {
  transports: ["polling"],
});

// Log the initial connection transport
socket.on("connect", () => {
  console.log("Connected using:", getTransportName());
});

// Log connection failures
socket.on("connect_error", (error) => {
  console.error("Connection failed:", error);
});

// Function to safely get the transport name
const getTransportName = (): string => {
  return (socket.io as any).engine?.transport?.name || "unknown";
};

// Function to log current transport (can be called anywhere)
export const logCurrentTransport = () => {
  console.log("Current transport:", getTransportName());
};

// Set up a periodic check for transport changes
let lastTransport = "";
setInterval(() => {
  const currentTransport = getTransportName();
  if (currentTransport !== lastTransport) {
    console.log("Transport changed to:", currentTransport);
    lastTransport = currentTransport;
  }
}, 1000); 