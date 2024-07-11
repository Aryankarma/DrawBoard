import { io } from "socket.io-client";

const url = "https://drawboard-0fw2.onrender.com";

export const socket = io(url);