import React from 'react';
import './OnlineUsers.css';

interface User {
  username: string;
  displayName: string;
  color: string;
}

interface OnlineUsersProps {
  users: User[];
  currentUser: User | null;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, currentUser }) => {
  return (
    <div className="online-users">
      <div className="online-users-header">
        <h4>👥 Usuarios Conectados</h4>
        <span className="user-count">{users.length}</span>
      </div>
      
      <div className="users-list">
        {users.map((user) => (
          <div 
            key={user.username} 
            className={`user-item ${user.username === currentUser?.username ? 'current-user' : ''}`}
          >
            <div 
              className="user-avatar" 
              style={{ backgroundColor: user.color }}
            >
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.displayName}</span>
              <span className="user-username">@{user.username}</span>
            </div>
            {user.username === currentUser?.username && (
              <span className="current-indicator">Tú</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
