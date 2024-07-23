import { io } from "socket.io-client";

const url = "https://drawboardserverfb.onrender.com";

export const socket = io(url
  // ,{
  // transports: ['websocket']
  // }
);
