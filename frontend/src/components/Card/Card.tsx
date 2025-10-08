import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../../types';
import './Card.css';

interface CardProps {
  card: CardType;
  onView?: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: isDragging ? CSS.Transform.toString(transform) : 'none',
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging && onView) {
      onView(card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`card ${isDragging ? 'dragging' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <h4>{card.title}</h4>
        <div className="drag-handle" {...listeners}>
          ⋮⋮
        </div>
      </div>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
    </div>
  );
};

export default Card;