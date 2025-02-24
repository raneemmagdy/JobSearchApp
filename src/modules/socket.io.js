import { Server } from "socket.io";
import { logOut, registerUser } from "./chat/services/chat.socket.service.js";

let io;
const userSocketMap = new Map(); 

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors:"*"
    })

    io.on("connection", async(socket) => {
        console.log(`New user connected: ${socket.id}`);
        await registerUser(socket)
        await logOut(socket)
    });
};

export { io, userSocketMap };
