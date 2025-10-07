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

@WSGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remover usuario de la lista de conectados
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join-board')
  handleJoinBoard(
    @MessageBody() data: { boardId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, userId } = data;
    
    // Unir al cliente a la sala del tablero
    client.join(`board-${boardId}`);
    
    // Guardar información del usuario
    this.connectedUsers.set(client.id, userId);
    
    this.logger.log(`User ${userId} joined board ${boardId}`);
    
    // Notificar a otros usuarios en el tablero
    client.to(`board-${boardId}`).emit('user-joined', {
      userId,
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
