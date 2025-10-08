import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, Column, Card } from '../types';
import { boardsApi, columnsApi, cardsApi } from '../services/api';
import { useWebSocket } from './useWebSocket';

export const useKanbanBoard = (boardId?: string, currentUser?: { username: string; displayName: string; color: string }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const { socket, joinBoard } = useWebSocket();

  // Cargar tablero
  const loadBoard = async () => {
    try {
      setLoading(true);
      if (boardId) {
        const response = await boardsApi.getById(boardId);
        setBoard(response.data);
      } else {
        // Buscar o crear el tablero compartido
        const SHARED_BOARD_NAME = 'Tablero Kanban Compartido';
        
        try {
          // Buscar todos los tableros
          const allBoards = await boardsApi.getAll();
          const sharedBoard = allBoards.data.find(board => board.name === SHARED_BOARD_NAME);
          
          if (sharedBoard) {
            // Usar el tablero compartido existente
            setBoard(sharedBoard);
          } else {
            // Crear el tablero compartido
            const response = await boardsApi.create({
              name: SHARED_BOARD_NAME,
              description: 'Tablero colaborativo para todos los usuarios'
            });
            setBoard(response.data);
          }
        } catch (error) {
          // Si hay error al buscar, crear uno nuevo
          console.error('❌ Error al buscar tableros:', error);
          const response = await boardsApi.create({
            name: SHARED_BOARD_NAME,
            description: 'Tablero colaborativo para todos los usuarios'
          });
          setBoard(response.data);
        }
      }
    } catch (err) {
      setError('Error al cargar el tablero');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva columna
  const createColumn = async (title: string) => {
    if (!board) return;
    
    try {
      const response = await columnsApi.create({
        name: title,
        boardId: board._id,
        position: board.columns.length
      });
      
      // NO actualizar localmente - esperar el evento WebSocket para evitar duplicados
      // setBoard(prev => prev ? {
      //   ...prev,
      //   columns: [...prev.columns, response.data]
      // } : null);
    } catch (err) {
      console.error('Error al crear columna:', err);
    }
  };

  // Crear nueva tarjeta
  const createCard = async (columnId: string, title: string, description?: string) => {
    if (!board) return;
    
    try {
      const column = board.columns.find(col => col._id === columnId);
      if (!column) return;

      const response = await cardsApi.create({
        title,
        description: description || '',
        columnId,
        position: column.cards.length,
        boardId: board._id 
      });

      // No agregar localmente, esperar el evento WebSocket para evitar duplicados
      // setBoard(prev => prev ? {
      //   ...prev,
      //   columns: prev.columns.map(col => 
      //     col._id === columnId 
      //       ? { ...col, cards: [...col.cards, response.data] }
      //       : col
      //   )
      // } : null);

      // Emitir evento WebSocket para notificar a otros usuarios
      if (socket && currentUser) {
        socket.emit('card-created', {
          card: response.data,
          columnId,
          createdBy: currentUser.username,
          boardId: board._id
        });
      }
    } catch (err) {
      console.error('Error al crear tarjeta:', err);
    }
  };

  // Mover tarjeta
  const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
    if (!board) return;

    try {
      await cardsApi.move(cardId, {
        targetColumnId: newColumnId,
        newPosition: newPosition
      });
      
      // Actualizar estado local
      setBoard(prev => {
        if (!prev) return null;

        const sourceColumn = prev.columns.find(col => 
          col.cards.some(card => card._id === cardId)
        );
        
        if (!sourceColumn) return prev;

        const card = sourceColumn.cards.find(card => card._id === cardId);
        if (!card) return prev;

        const targetColumn = prev.columns.find(col => col._id === newColumnId);
        if (!targetColumn) return prev;

        // Si es la misma columna, solo reordenar
        if (sourceColumn._id === newColumnId) {
          const currentPosition = sourceColumn.cards.findIndex(c => c._id === cardId);
          const newCards = [...sourceColumn.cards];
          
          // Remover de la posición actual
          newCards.splice(currentPosition, 1);
          // Insertar en la nueva posición
          newCards.splice(newPosition, 0, { ...card, columnId: newColumnId });
          
          return {
            ...prev,
            columns: prev.columns.map(col => 
              col._id === newColumnId 
                ? { ...col, cards: newCards }
                : col
            )
          };
        } else {
          // Diferente columna
          const updatedSourceColumn = {
            ...sourceColumn,
            cards: sourceColumn.cards.filter(c => c._id !== cardId)
          };

          const newCards = [...targetColumn.cards];
          newCards.splice(newPosition, 0, { ...card, columnId: newColumnId });
          
          const updatedTargetColumn = {
            ...targetColumn,
            cards: newCards
          };

          return {
            ...prev,
            columns: prev.columns.map(col => {
              if (col._id === sourceColumn._id) return updatedSourceColumn;
              if (col._id === newColumnId) return updatedTargetColumn;
              return col;
            })
          };
        }
      });

      // Emitir evento WebSocket para notificar a otros usuarios
      if (socket && currentUser) {
        socket.emit('card-moved', {
          cardId,
          targetColumnId: newColumnId,
          newPosition,
          movedBy: currentUser.username,
          boardId: board._id
        });
      }
    } catch (err) {
      console.error('Error al mover tarjeta:', err);
    }
  };

  // Actualizar columna
const updateColumn = async (columnId: string, data: { name?: string }) => {
  if (!board) return;
  
  try {
    await columnsApi.update(columnId, data);
    
    setBoard(prev => prev ? {
      ...prev,
      columns: prev.columns.map(col => 
        col._id === columnId 
          ? { ...col, ...data }
          : col
      )
    } : null);
  } catch (err) {
    console.error('Error al actualizar columna:', err);
  }
};

  // Eliminar columna
  const deleteColumn = async (columnId: string) => {
    if (!board) return;
    
    try {
      await columnsApi.delete(columnId);
      
      setBoard(prev => prev ? {
        ...prev,
        columns: prev.columns.filter(col => col._id !== columnId)
      } : null);
    } catch (err) {
      console.error('Error al eliminar columna:', err);
    }
  };


  // Actualizar tarjeta
  const updateCard = async (cardId: string, data: { title?: string; description?: string }) => {
    if (!board) return;
    
    try {
      const response = await cardsApi.update(cardId, data);
      
      setBoard(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: col.cards.map(card => 
              card._id === cardId ? { ...card, ...response.data } : card
            )
          }))
        };
      });

      // Emitir evento WebSocket para notificar a otros usuarios
      if (socket && currentUser) {
        socket.emit('card-updated', {
          cardId,
          updates: data,
          updatedBy: currentUser.username,
          boardId: board._id
        });
      }
    } catch (err) {
      console.error('Error al actualizar tarjeta:', err);
    }
  };

  // Eliminar tarjeta
  const deleteCard = async (cardId: string) => {
    if (!board) return;
    
    try {
      await cardsApi.delete(cardId);
      
      setBoard(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: col.cards.filter(card => card._id !== cardId)
          }))
        };
      });

      // Emitir evento WebSocket para notificar a otros usuarios
      if (socket && currentUser) {
        socket.emit('card-deleted', {
          cardId,
          deletedBy: currentUser.username,
          boardId: board._id
        });
      }
    } catch (err) {
      console.error('Error al eliminar tarjeta:', err);
    }
  };

  // Handlers para drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board?.columns
      .flatMap(col => col.cards)
      .find(card => card._id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !board) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Encontrar la columna origen de la tarjeta
    const sourceColumn = board.columns.find(col => 
      col.cards.some(card => card._id === cardId)
    );
    
    if (!sourceColumn) return;

    // Si se suelta sobre una columna
    const targetColumn = board.columns.find(col => col._id === overId);
    if (targetColumn) {
      // Si es la misma columna, no hacer nada
      if (sourceColumn._id === targetColumn._id) return;
      
      // Mover al final de la columna destino
      moveCard(cardId, overId, targetColumn.cards.length);
      return;
    }

    // Si se suelta sobre otra tarjeta
    const targetCard = board.columns
      .flatMap(col => col.cards)
      .find(card => card._id === overId);
    
    if (targetCard) {
      const targetColumn = board.columns.find(col => 
        col.cards.some(card => card._id === overId)
      );
      if (targetColumn) {
        const newPosition = targetColumn.cards.findIndex(card => card._id === overId);
        
        // Si es la misma columna, ajustar la posición
        if (sourceColumn._id === targetColumn._id) {
          const sourcePosition = sourceColumn.cards.findIndex(card => card._id === cardId);
          if (sourcePosition < newPosition) {
            // Si se mueve hacia abajo, ajustar posición
            moveCard(cardId, targetColumn._id, newPosition - 1);
          } else {
            moveCard(cardId, targetColumn._id, newPosition);
          }
        } else {
          // Diferente columna
          moveCard(cardId, targetColumn._id, newPosition);
        }
      }
    }
  };

  // Configurar eventos WebSocket para colaboración en tiempo real
  useEffect(() => {
    
    if (socket && board && currentUser) {
      // Unirse al tablero
      joinBoard(board._id);

      // Escuchar actualizaciones de tarjetas
      socket.on('card-updated', (data) => {
        setBoard(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            columns: prev.columns.map(col => ({
              ...col,
              cards: col.cards.map(card => 
                card._id === data.cardId ? { ...card, ...data.updates } : card
              )
            }))
          };
        });
      });

      // Escuchar nuevas tarjetas
      socket.on('card-created', (data) => {
        setBoard(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            columns: prev.columns.map(col => {
              if (col._id === data.columnId) {
                // Verificar si la tarjeta ya existe para evitar duplicados
                const cardExists = col.cards.some(card => card._id === data.card._id);
                if (!cardExists) {
                  return { ...col, cards: [...col.cards, data.card] };
                }
              }
              return col;
            })
          };
        });
      });

      // Escuchar tarjetas eliminadas
      socket.on('card-deleted', (data) => {
        if (data.deletedBy !== currentUser.username) {
          setBoard(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              columns: prev.columns.map(col => ({
                ...col,
                cards: col.cards.filter(card => card._id !== data.cardId)
              }))
            };
          });
        }
      });

      // Escuchar tarjetas movidas
      socket.on('card-moved', (data) => {
        if (data.movedBy !== currentUser.username) {
          setBoard(prev => {
            if (!prev) return null;
            
            const sourceColumn = prev.columns.find(col => 
              col.cards.some(card => card._id === data.cardId)
            );
            
            if (!sourceColumn) return prev;

            const card = sourceColumn.cards.find(card => card._id === data.cardId);
            if (!card) return prev;

            const targetColumn = prev.columns.find(col => col._id === data.targetColumnId);
            if (!targetColumn) return prev;

            // Remover de columna origen
            const updatedSourceColumn = {
              ...sourceColumn,
              cards: sourceColumn.cards.filter(c => c._id !== data.cardId)
            };

            // Agregar a columna destino
            const newCards = [...targetColumn.cards];
            newCards.splice(data.newPosition, 0, { ...card, columnId: data.targetColumnId });
            
            const updatedTargetColumn = {
              ...targetColumn,
              cards: newCards
            };

            return {
              ...prev,
              columns: prev.columns.map(col => {
                if (col._id === sourceColumn._id) return updatedSourceColumn;
                if (col._id === data.targetColumnId) return updatedTargetColumn;
                return col;
              })
            };
          });
        }
      });

      // Escuchar nuevas columnas
      socket.on('column-created', (data) => {
        setBoard(prev => {
          if (!prev) return null;
          
          // Verificar si la columna ya existe para evitar duplicados
          const columnExists = prev.columns.some(col => col._id === data.column._id);
          if (columnExists) {
            return prev;
          }
          
          return {
            ...prev,
            columns: [...prev.columns, data.column]
          };
        });
      });

      // Escuchar columnas actualizadas
      socket.on('column-updated', (data) => {
        setBoard(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            columns: prev.columns.map(col => 
              col._id === data.column._id ? data.column : col
            )
          };
        });
      });

      // Escuchar columnas eliminadas
      socket.on('column-deleted', (data) => {
        setBoard(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            columns: prev.columns.filter(col => col._id !== data.columnId)
          };
        });
      });


      // Limpiar listeners al desmontar
      return () => {
        socket.off('card-updated');
        socket.off('card-created');
        socket.off('card-deleted');
        socket.off('card-moved');
        socket.off('column-created');
        socket.off('column-updated');
        socket.off('column-deleted');
        socket.off('board-updated');
      };
    } else {
    }
  }, [socket, board, currentUser, joinBoard]);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  return {
    board,
    loading,
    error,
    activeCard,
    createColumn,
    createCard,
    moveCard,
    deleteColumn,
    updateColumn,
    updateCard,
    deleteCard,
    handleDragStart,
    handleDragEnd,
    loadBoard
  };
};