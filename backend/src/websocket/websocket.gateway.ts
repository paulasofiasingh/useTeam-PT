import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@WSGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');
  private connectedUsers: Map<string, string> = new Map(); // socketId -> username
  private connectedUsersData: Map<string, any> = new Map(); // socketId -> user data

  constructor(private readonly usersService: UsersService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  getConnectedUsers() {
    const users = Array.from(this.connectedUsersData.values());
    this.logger.log(`Returning ${users.length} connected users`);
    return users;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Actualizar estado del usuario en la base de datos
    const username = this.connectedUsers.get(client.id);
    if (username) {
      this.usersService.disconnectUser(client.id);
      this.connectedUsers.delete(client.id);
      this.connectedUsersData.delete(client.id);
      
      // Notificar a otros usuarios que este usuario se desconectó
      this.server.emit('user-disconnected', {
        username,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('user-login')
  async handleUserLogin(
    @MessageBody() data: { username: string; displayName: string; email: string; color?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { username, displayName, email, color } = data;
      
      // Validar datos de entrada
      if (!username || !displayName || !email) {
        throw new Error('Username, displayName y email son requeridos');
      }
      
      if (username.length < 2 || username.length > 20) {
        throw new Error('Username debe tener entre 2 y 20 caracteres');
      }
      
      if (displayName.length < 2 || displayName.length > 30) {
        throw new Error('DisplayName debe tener entre 2 y 30 caracteres');
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email debe tener un formato válido');
      }
      
      // Verificar si el usuario ya existe
      let user;
      try {
        user = await this.usersService.findOne(username);
        // Si existe, actualizar estado online
        user = await this.usersService.updateOnlineStatus(username, true, client.id);
      } catch (error) {
        // Si no existe, crear nuevo usuario
        const userColor = color || await this.usersService.generateRandomColor();
        user = await this.usersService.create({
          username,
          displayName,
          email,
          color: userColor
        });
        user = await this.usersService.updateOnlineStatus(username, true, client.id);
      }
      
      // Guardar información del usuario
      this.connectedUsers.set(client.id, username);
      this.connectedUsersData.set(client.id, {
        username: user.username,
        displayName: user.displayName,
        color: user.color,
        socketId: client.id
      });
      
      this.logger.log(`User ${username} logged in`);
      
      // Enviar confirmación al cliente
      client.emit('user-logged-in', {
        success: true,
        user: {
          username: user.username,
          displayName: user.displayName,
          color: user.color
        }
      });

      // Notificar a todos los usuarios que alguien se conectó
      this.server.emit('user-connected', {
        username: user.username,
        displayName: user.displayName,
        color: user.color,
        timestamp: new Date().toISOString(),
      });

      return { success: true, user };
    } catch (error) {
      this.logger.error('Error in user login:', error);
      client.emit('user-login-error', {
        success: false,
        message: error.message
      });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('join-board')
  handleJoinBoard(
    @MessageBody() data: { boardId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, username } = data;
    
    // Unir al cliente a la sala del tablero
    client.join(`board-${boardId}`);
    
    this.logger.log(`User ${username} joined board ${boardId}`);
    
    // Notificar a otros usuarios en el tablero
    client.to(`board-${boardId}`).emit('user-joined-board', {
      username,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: `Joined board ${boardId}` };
  }

  @SubscribeMessage('leave-board')
  handleLeaveBoard(
    @MessageBody() data: { boardId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, userId } = data;
    
    // Salir de la sala del tablero
    client.leave(`board-${boardId}`);
    
    this.logger.log(`User ${userId} left board ${boardId}`);
    
    // Notificar a otros usuarios en el tablero
    client.to(`board-${boardId}`).emit('user-left', {
      userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: `Left board ${boardId}` };
  }

  @SubscribeMessage('card-moved')
  handleCardMoved(
    @MessageBody() data: {
      boardId: string;
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      newPosition: number;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, cardId, fromColumnId, toColumnId, newPosition, userId } = data;
    
    this.logger.log(`Card ${cardId} moved by user ${userId} in board ${boardId}`);
    
    // Notificar a todos los usuarios en el tablero (excepto al que movió la tarjeta)
    client.to(`board-${boardId}`).emit('card-moved', {
      cardId,
      fromColumnId,
      toColumnId,
      newPosition,
      movedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Card move broadcasted' };
  }

  @SubscribeMessage('card-updated')
  handleCardUpdated(
    @MessageBody() data: {
      boardId: string;
      cardId: string;
      updates: any;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, cardId, updates, userId } = data;
    
    this.logger.log(`Card ${cardId} updated by user ${userId} in board ${boardId}`);
    
    // Notificar a todos los usuarios en el tablero (excepto al que actualizó la tarjeta)
    client.to(`board-${boardId}`).emit('card-updated', {
      cardId,
      updates,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Card update broadcasted' };
  }

  @SubscribeMessage('column-updated')
  handleColumnUpdated(
    @MessageBody() data: {
      boardId: string;
      columnId: string;
      updates: any;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, columnId, updates, userId } = data;
    
    this.logger.log(`Column ${columnId} updated by user ${userId} in board ${boardId}`);
    
    // Notificar a todos los usuarios en el tablero (excepto al que actualizó la columna)
    client.to(`board-${boardId}`).emit('column-updated', {
      columnId,
      updates,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Column update broadcasted' };
  }

  @SubscribeMessage('board-updated')
  handleBoardUpdated(
    @MessageBody() data: {
      boardId: string;
      updates: any;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, updates, userId } = data;
    
    this.logger.log(`Board ${boardId} updated by user ${userId}`);
    
    // Notificar a todos los usuarios en el tablero (excepto al que actualizó el tablero)
    client.to(`board-${boardId}`).emit('board-updated', {
      updates,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Board update broadcasted' };
  }

  // Método para obtener usuarios conectados en un tablero
  getConnectedUsersInBoard(boardId: string): string[] {
    const users: string[] = [];
    this.connectedUsers.forEach((userId, socketId) => {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket && socket.rooms.has(`board-${boardId}`)) {
        users.push(userId);
      }
    });
    return users;
  }
}
