import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Card as CardType } from '../../types';
import Card from '../Card/Card';
import './Column.css';

interface ColumnProps {
  column: ColumnType;
  onAddCard?: (columnId: string, title: string, description?: string) => void;
  onViewCard?: (card: CardType) => void;
  onEditColumn?: (column: ColumnType) => void;
  onDeleteColumn?: (columnId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onViewCard,
  onEditColumn,
  onDeleteColumn,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const handleAddCard = () => {
    if (newCardTitle.trim() && onAddCard) {
      onAddCard(column._id, newCardTitle.trim(), newCardDescription.trim() || undefined);
      setNewCardTitle('');
      setNewCardDescription('');
      setIsAddingCard(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
      setNewCardDescription('');
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>{column.name}</h3>
        <div className="column-actions">
  {onEditColumn && (
    <button onClick={() => onEditColumn(column)} className="btn-edit">
      ✏️
    </button>
  )}
  {onDeleteColumn && (
    <button onClick={() => onDeleteColumn(column._id)} className="btn-delete">
      🗑️
    </button>
  )}
</div>
      </div>

      <div
        ref={setNodeRef}
        className="column-content"
      >
        <SortableContext
          items={column.cards.map(card => card._id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              onView={onViewCard}
            />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className="add-card-form">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Título de la tarjeta..."
              autoFocus
              className="card-input"
            />
            <textarea
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              placeholder="Descripción (opcional)..."
              className="card-description-input"
              rows={3}
            />
            <div className="add-card-actions">
              <button onClick={handleAddCard} className="btn-save">
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                  setNewCardDescription('');
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="add-card-btn"
          >
            + Agregar tarjeta
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;