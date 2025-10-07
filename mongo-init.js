// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the kanban-board database
db = db.getSiblingDB('kanban-board');

// Create collections with validation
db.createCollection('boards', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'createdAt', 'updatedAt'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Board name is required and must be a string'
        },
        description: {
          bsonType: 'string',
          description: 'Board description must be a string'
        },
        columns: {
          bsonType: 'array',
          description: 'Columns must be an array'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date is required'
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'createdAt'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username is required and must be a string'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required'
        }
      }
    }
  }
});

// Create indexes for better performance
db.boards.createIndex({ 'name': 1 });
db.boards.createIndex({ 'createdAt': -1 });
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });

print('MongoDB initialization completed successfully!');
