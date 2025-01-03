// // Server-side Socket.IO example
// import { Server } from 'socket.io';

// const io = new Server(httpServer);

// io.on('connection', (socket) => {
//   // Socket.IO automatically handles reconnection
//   socket.on('joinRoom', (roomId) => {
//     socket.join(roomId);
//     // Broadcast to others in the room
//     socket.to(roomId).emit('userJoined', socket.id);
//   });

//   // Built-in room functionality
//   socket.on('songUpdate', (data) => {
//     io.to(data.roomId).emit('songChanged', data);
//   });
// });