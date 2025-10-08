import React, { useState } from 'react';
import Board from './components/Board/Board';
import Login from './components/Login/Login';
import OnlineUsers from './components/OnlineUsers/OnlineUsers';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { currentUser, onlineUsers, login, isConnected } = useWebSocket();

  const handleLogin = (username: string, displayName: string, email: string, color: string) => {
    login(username, displayName, email, color);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="app-title">
          <h1>🎯 Kanban Colaborativo</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </span>
          </div>
        </div>
        <div className="user-info">
          <div 
            className="current-user-avatar" 
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="current-user-name">{currentUser.displayName}</span>
        </div>
      </div>
      
      <div className="app-content">
        <div className="sidebar">
          <OnlineUsers users={onlineUsers} currentUser={currentUser} />
        </div>
        <div className="main-content">
          <Board currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}

export default App;