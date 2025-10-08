import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, displayName: string, email: string, color: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState('#007bff');
  const [error, setError] = useState('');

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !displayName.trim() || !email.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (username.length < 2 || username.length > 20) {
      setError('El nombre de usuario debe tener entre 2 y 20 caracteres');
      return;
    }

    if (displayName.length < 2 || displayName.length > 30) {
      setError('El nombre para mostrar debe tener entre 2 y 30 caracteres');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setError('');
    onLogin(username.trim(), displayName.trim(), email.trim(), selectedColor);
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h1>🎯 Kanban Colaborativo</h1>
          <p>Ingresa tu información para comenzar a colaborar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: juan123"
              maxLength={20}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Nombre para Mostrar:</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ej: Juan Pérez"
              maxLength={30}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: juan@ejemplo.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Color de Usuario:</label>
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            🚀 Entrar al Tablero
          </button>
        </form>

        <div className="login-footer">
          <p>💡 <strong>Tip:</strong> El nombre de usuario debe ser único</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
