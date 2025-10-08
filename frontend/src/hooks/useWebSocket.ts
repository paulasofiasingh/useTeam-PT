import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  username: string;
  displayName: string;
  color: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: User | null;
  onlineUsers: User[];
  login: (username: string, displayName: string, email: string, color: string) => void;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Crear conexión WebSocket
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
        transports: ['polling', 'websocket'],
        forceNew: true,
        timeout: 20000,
      });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
      setIsConnected(false);
    });

    // Eventos de usuario
    newSocket.on('user-logged-in', (data) => {
      if (data.success) {
        setCurrentUser(data.user);
        console.log('✅ Usuario logueado:', data.user);
      }
    });

    newSocket.on('user-login-error', (data) => {
      console.error('❌ Error al hacer login:', data);
      alert(`Error al hacer login: ${data.message || 'Error desconocido'}`);
    });

    // Eventos de conexión con errores
    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      setIsConnected(false);
    });

    newSocket.on('user-connected', (data) => {
      console.log('👤 Usuario conectado:', data);
      setOnlineUsers(prev => {
        const exists = prev.find(user => user.username === data.username);
        if (!exists) {
          return [...prev, {
            username: data.username,
            displayName: data.displayName,
            color: data.color
          }];
        }
        return prev;
      });
    });

    newSocket.on('user-disconnected', (data) => {
      console.log('👋 Usuario desconectado:', data);
      setOnlineUsers(prev => prev.filter(user => user.username !== data.username));
    });

    newSocket.on('user-joined-board', (data) => {
      console.log('📋 Usuario se unió al tablero:', data);
    });

    // Limpiar conexión al desmontar
    return () => {
      newSocket.close();
    };
  }, []);

  const login = (username: string, displayName: string, email: string, color: string) => {
    if (socketRef.current) {
      socketRef.current.emit('user-login', {
        username,
        displayName,
        email,
        color
      });
    }
  };

  const joinBoard = (boardId: string) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('join-board', {
        boardId,
        username: currentUser.username
      });
    }
  };

  const leaveBoard = (boardId: string) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('leave-board', {
        boardId,
        username: currentUser.username
      });
    }
  };

  return {
    socket,
    isConnected,
    currentUser,
    onlineUsers,
    login,
    joinBoard,
    leaveBoard
  };
};
