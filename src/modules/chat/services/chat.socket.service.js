import { authSocket } from "../../../middleware/authentication.js"
import { userSocketMap } from "../../socket.io.js"

export const registerUser = async (socket) => {
    const data = await authSocket({ socket })
    if (data.statusCode != 200) {
        return socket.emit('authError', data)
    }
    userSocketMap.set(data.user._id.toString(), socket.id)
    return 'done'
}
export const logOut = async (socket) => {
    return socket.on("disconnect", async () => {
        const data = await authSocket({ socket })
        if (data.statusCode != 200) {
            return socket.emit('authError', data)
        }
        userSocketMap.delete(data.user._id.toString(), socket.id)
        return 'done'
    })
}