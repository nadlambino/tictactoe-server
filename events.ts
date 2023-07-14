import { Socket } from "socket.io"

export interface User {
    id: String,
    username: String
}

export interface Room {
    room_id: String,
    users: User[]
}

export const removeEmptyRoom = (rooms: Room[]) => {
    return rooms.filter(r => r.users.length > 0)
}

export const playerJoined = (socket: Socket, username: String, room: string, rooms: Room[]) : Room[] => {
    const r = rooms.find(r => r.room_id === room)
    let hasJoined = false;
    let users : User[] = [];

    if (r === undefined) {
        users = [{id: socket.id, username}]
        hasJoined = true
    } else if (r && r.users.length < 2) {
        const u = r.users
        u.push({id: socket.id, username})
        users = u;
        hasJoined = true
    } else {
        hasJoined = false
    }

    if (hasJoined) {
        socket.join(room)
        socket.emit('joined', true)
        const roomIndex = rooms.findIndex(r => r.room_id === room)
        
        if (roomIndex > -1) {
            rooms[roomIndex] = {
                room_id: room,
                users
            }
        } else {
            rooms.push({
                room_id: room,
                users
            })
        }
    } else {
        socket.emit('joined', false)
    }

    return rooms;
}

export const playerDisconnected = (socket: Socket, room: string, rooms: Room[]) : Room[] => {
    socket.on('disconnect', () => {
        const userRoom = rooms.find(r => r.users.find(u => u.id === socket.id))
        const disconnnectedUser = userRoom?.users.find(u => u.id === socket.id)
    
        if (userRoom && userRoom?.users.length <= 1) {
            rooms = rooms.filter(r => r.room_id === userRoom?.room_id)
        } else {
            const index = rooms.findIndex(r => r.users.find(u => u.id === socket.id))
    
            if (index > -1) {
                const users = userRoom?.users.filter(u => u.id !== socket.id) ?? []
    
                rooms[index] = {
                ...rooms[index],
                users
                }
            }
    
            socket.to(room).emit('player_disconnected', disconnnectedUser?.username)
        }

        return rooms;
    })

    return rooms;
}