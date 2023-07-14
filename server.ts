import express, { Express, Request, Response } from 'express';
require('dotenv').config()
const app: Express = express()
const cors = require('cors')
const parser = require('body-parser')
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
import { Socket } from 'socket.io';
import { Room, playerDisconnected, playerJoined, removeEmptyRoom } from './events';
const io = new Server(server, {
  cors: {
    origins: [process.env.APP_URL]
  },
});

app.use(cors())
app.use(express.json())
app.use(parser.urlencoded({extended: false}))
app.use(parser.json())

app.get('/', (_: Request, res: Response) => res.json('Welcome to tictactoe API'))

let rooms : Room[] = [];

io.on('connection', (socket: Socket) => {
  console.log(`User connected with ID: ${socket.id}`)
  removeEmptyRoom(rooms);

  socket.on('join', ({username, room}) => {
    rooms = playerJoined(socket, username, room, rooms)
    rooms = playerDisconnected(socket, room, rooms)
    socket.on('move', (data) => socket.to(room).emit('move', data))
    socket.on('change_player', (data) => socket.to(room).emit('change_player', data))
    socket.on('draw', (data) => socket.to(room).emit('draw', data))
    socket.on('reset', () => socket.to(room).emit('reset'))
  })
});

server.listen(process.env.PORT, () => {
  console.log(`Server started. Listening at port ${process.env.PORT}`)
})
    
