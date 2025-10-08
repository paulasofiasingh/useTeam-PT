import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import Column from '../Column/Column';
import Card from '../Card/Card';
import CardModal from '../CardModal/CardModal';
import { Card as CardType } from '../../types';
import './Board.css';
import Swal from 'sweetalert2';

interface BoardProps {
  boardId?: string;
  currentUser?: {
    username: string;
    displayName: string;
    color: string;
  };
}

const Board: React.FC<BoardProps> = ({ boardId, currentUser }) => {
  const {
    board,
    loading,
    error,
    activeCard,
    createColumn,
    deleteColumn,
    updateColumn,
    createCard,
    updateCard,
    deleteCard,
    handleDragStart,
    handleDragEnd
  } = useKanbanBoard(boardId, currentUser);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmail, setExportEmail] = useState('');

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    } else if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnTitle('');
    }
  };

  const handleViewCard = (card: CardType) => {
    setSelectedCard(card);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setSelectedCard(card);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleExportBacklog = () => {
    setShowExportModal(true);
  };

  const handleConfirmExport = async () => {
    if (!exportEmail.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingresa un email válido',
        icon: 'error'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/export/backlog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: board?._id,
          emailTo: exportEmail.trim()
        })
      });

      if (response.ok) {
        setShowExportModal(false);
        setExportEmail('');
        Swal.fire({
          title: '¡Exportación iniciada!',
          text: `El backlog se está exportando y será enviado a ${exportEmail}`,
          icon: 'success',
          timer: 3000
        });
      } else {
        throw new Error('Error al exportar backlog');
      }
    } catch (error) {
      console.error('Error al exportar backlog:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar el backlog. Inténtalo de nuevo.',
        icon: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    setIsEditMode(false);
  };

  const handleSaveCard = async (cardId: string, title: string, description: string) => {
    try {
      await updateCard(cardId, { title, description });
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar tarjeta:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
      handleCloseModal();
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
    }
  };

  if (loading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tablero...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-error">
        <p>No se pudo cargar el tablero</p>
      </div>
    );
  }

  return (
    <div className="board">
      <div className="board-header">
        <div className="board-title">
          <h1>{board.name}</h1>
          {board.description && (
            <p className="board-description">{board.description}</p>
          )}
        </div>
        <div className="board-actions">
          <button 
            onClick={handleExportBacklog}
            className="export-btn"
            title="Exportar backlog a CSV por email"
          >
            📊 Exportar Backlog
          </button>
        </div>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-content">
          {board.columns.map((column) => (
            <Column
            key={column._id}
            column={column}
            onAddCard={(columnId, title, description) => {
              createCard(columnId, title, description);
            }}
            onViewCard={handleViewCard}
            onEditColumn={async (column) => {
              const { value: newName } = await Swal.fire({
                title: 'Editar columna',
                input: 'text',
                inputValue: column.name,
                inputPlaceholder: 'Nombre de la columna',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                  if (!value) {
                    return 'El nombre no puede estar vacío';
                  }
                }
              });
              
              if (newName && newName !== column.name) {
                updateColumn(column._id, { name: newName });
              }
            }}
            onDeleteColumn={async (columnId) => {
              const column = board?.columns.find(col => col._id === columnId);
              const columnName = column?.name || 'esta columna';
              
              const result = await Swal.fire({
                title: '¿Eliminar columna?',
                text: `¿Estás seguro de que quieres eliminar la columna "${columnName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
              });
              
              if (result.isConfirmed) {
                deleteColumn(columnId);
                Swal.fire('Eliminada', 'La columna ha sido eliminada', 'success');
              }
            }}
          />
          ))}

          {isAddingColumn ? (
            <div className="add-column-form">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Título de la columna..."
                autoFocus
                className="column-input"
              />
              <div className="add-column-actions">
                <button onClick={handleAddColumn} className="btn-save">
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle('');
                  }}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="add-column-btn"
            >
              + Agregar columna
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card card={activeCard} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        initialEditMode={isEditMode}
      />

      {/* Modal de Exportación */}
      {showExportModal && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <div className="export-modal-header">
              <h3>📊 Exportar Backlog</h3>
              <button 
                className="close-btn"
                onClick={() => setShowExportModal(false)}
              >
                ×
              </button>
            </div>
            <div className="export-modal-body">
              <p>Ingresa el email donde quieres recibir el archivo CSV con el backlog del tablero:</p>
              <input
                type="email"
                value={exportEmail}
                onChange={(e) => setExportEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="export-email-input"
              />
              <div className="export-modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-export"
                  onClick={handleConfirmExport}
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;