import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific origins in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for specific patient
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User joined room: user_${userId}`);
    });

    // Join room for specific doctor
    socket.on('join_doctor', (docId) => {
      socket.join(`doctor_${docId}`);
      console.log(`🩺 Doctor joined room: doctor_${docId}`);
    });

    // Join room for admin updates
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log('👑 Admin joined admin_room');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToDoctor = (docId, event, data) => {
  if (io) {
    io.to(`doctor_${docId}`).emit(event, data);
  }
};

export const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin_room').emit(event, data);
  }
};
