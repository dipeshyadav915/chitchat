import { io } from "socket.io-client";

const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const socket = io(backendUrl, {
  autoConnect: true,
});

export default socket;
