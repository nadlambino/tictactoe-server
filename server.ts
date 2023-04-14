import express, { Express, Request, Response } from 'express';
require('dotenv').config()
const app: Express = express()
const cors = require('cors')
const parser = require('body-parser')
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
import { Socket } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: process.env.APP_URL
  },
});

app.use(cors())
app.use(express.json())
app.use(parser.urlencoded({extended: false}))
app.use(parser.json())

app.get('/', (_: Request, res: Response) => res.json('Welcome to tictactoe API'))

io.on('connection', (socket: Socket) => {
  console.log(`User connected with ID: ${socket.id}`)

  socket.on('join', ({username, room}) => {
    socket.join(room)
    
    socket.on('move', (data) => {
      socket.to(room).emit('move', data)
    })
    
    socket.on('change_player', (data) => {
      socket.to(room).emit('change_player', data)
    })

    socket.on('draw', (data) => {
      socket.to(room).emit('draw', data)
    })

    socket.on('reset', () => {
      socket.to(room).emit('reset')
    })

    console.log(`Player ${username} has joined the room ${room}`)
  })
});

server.listen(process.env.PORT, () => {
  console.log(`Server started. Listening at port ${process.env.PORT}`)
})
    
