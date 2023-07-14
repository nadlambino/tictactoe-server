import express, { Express, Request, Response } from 'express';
require('dotenv').config()
const app: Express = express()
const cors = require('cors')
const parser = require('body-parser')
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
import { onConnect } from './events';
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

onConnect(io)

server.listen(process.env.PORT, () => {
  console.log(`Server started. Listening at port ${process.env.PORT}`)
})
    
