import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, Column, Card } from '../types';
import { boardsApi, columnsApi, cardsApi } from '../services/api';

export const useKanbanBoard = (boardId?: string) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Cargar tablero
  const loadBoard = async () => {
    try {
      setLoading(true);
      if (boardId) {
        const response = await boardsApi.getById(boardId);
        setBoard(response.data);
      } else {
        // Si no hay boardId, crear un tablero por defecto
        const response = await boardsApi.create({
          name: 'Mi Tablero Kanban',
          description: 'Tablero creado automáticamente'
        });
        setBoard(response.data);
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
      
      setBoard(prev => prev ? {
        ...prev,
        columns: [...prev.columns, response.data]
      } : null);
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

      setBoard(prev => prev ? {
        ...prev,
        columns: prev.columns.map(col => 
          col._id === columnId 
            ? { ...col, cards: [...col.cards, response.data] }
            : col
        )
      } : null);
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

        // Remover tarjeta de la columna origen
        const updatedSourceColumn = {
          ...sourceColumn,
          cards: sourceColumn.cards.filter(c => c._id !== cardId)
        };

        // Agregar tarjeta a la columna destino
        const updatedTargetColumn = {
          ...targetColumn,
          cards: arrayMove(targetColumn.cards, newPosition, newPosition)
        };
        updatedTargetColumn.cards[newPosition] = { ...card, columnId: newColumnId };

        return {
          ...prev,
          columns: prev.columns.map(col => {
            if (col._id === sourceColumn._id) return updatedSourceColumn;
            if (col._id === newColumnId) return updatedTargetColumn;
            return col;
          })
        };
      });
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

    // Si se suelta sobre una columna
    const targetColumn = board.columns.find(col => col._id === overId);
    if (targetColumn) {
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
        moveCard(cardId, targetColumn._id, newPosition);
      }
    }
  };

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