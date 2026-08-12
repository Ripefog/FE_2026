// lib/socket.ts
import { io } from "socket.io-client";

const socket_url = process.env.NEXT_PUBLIC_SOCKET_SERVER
const socket = io(socket_url, {
  transports: ["websocket"], // bắt buộc dùng websocket thuần
});


// // Lắng nghe event connect
// socket.on("connect", () => {
//   console.log("✅ Socket connected:", socket.id);
// });

// // Lắng nghe event disconnect
// socket.on("disconnect", (reason) => {
//   console.log("❌ Socket disconnected:", reason);
// });

export default socket;
