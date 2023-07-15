import { Socket } from "socket.io"

let rooms : Room[] = [];

export interface User {
    id: string,
    username: string
}

export interface Room {
    room_id: string,
    users: User[]
}

export const onConnect = (io: any) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected with ID: ${socket.id}`)
        removeEmptyRoom()

        socket.on('join', async ({ username, room }) => {
            await playerJoined(socket, username, room)
            socket.on('move', (data) => socket.to(room).emit('move', data))
            socket.on('change_player', (data) => socket.to(room).emit('change_player', data))
            socket.on('draw', (data) => socket.to(room).emit('draw', data))
            socket.on('reset', () => socket.to(room).emit('reset'))
            playerDisconnected(socket, room)
        })
    });
}

const removeEmptyRoom = () => {
    rooms = rooms.filter(r => r.users.length > 0)
}

const playerJoined = async (socket: Socket, username: string, room: string) => {
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
        await socket.join(room)
        socket.emit('joined', true, username)
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
}

const playerDisconnected = (socket: Socket, room: string) => {
    socket.on('disconnect', () => {
        const userRoom = rooms.find(r => r.users.find(u => u.id === socket.id))
        const disconnnectedUser = userRoom?.users.find(u => u.id === socket.id)
    
        if (userRoom && userRoom?.users.length <= 1) {
            rooms = rooms.filter(r => r.room_id !== userRoom?.room_id)
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
    })
}