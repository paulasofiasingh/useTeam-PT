import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../../types';
import './CardModal.css';

interface CardModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, title: string, description: string) => void;
  onDelete: (cardId: string) => void;
  initialEditMode?: boolean;
}

const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEditMode = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setIsEditing(initialEditMode);
    }
  }, [card, initialEditMode]);

  const handleSave = () => {
    if (card && title.trim()) {
      onSave(card._id, title.trim(), description.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (card && window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      onDelete(card._id);
      // No cerramos el modal automáticamente, dejamos que el componente padre lo maneje
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      if (isEditing) {
        setIsEditing(false);
        setTitle(card?.title || '');
        setDescription(card?.description || '');
      } else {
        onClose();
      }
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalles de la Tarjeta</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="card-title">Título:</label>
            {isEditing ? (
              <input
                id="card-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="form-input"
                autoFocus
              />
            ) : (
              <p className="card-title-display">{title}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="card-description">Descripción:</label>
            {isEditing ? (
              <textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="form-textarea"
                rows={6}
                placeholder="Agrega una descripción..."
              />
            ) : (
              <div className="card-description-display">
                {description || <em>Sin descripción</em>}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn-save">
                Guardar
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setTitle(card.title);
                  setDescription(card.description || '');
                }} 
                className="btn-cancel"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Editar
              </button>
              <button onClick={handleDelete} className="btn-delete">
                Eliminar
              </button>
              <button onClick={onClose} className="btn-close">
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
