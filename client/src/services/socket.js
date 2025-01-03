// client/src/services/socket.js
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000') // Match your server port

export default socket