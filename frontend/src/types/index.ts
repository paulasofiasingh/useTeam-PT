export interface Board {
    _id: string;
    name: string;
    description?: string;
    columns: Column[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Column {
    _id: string;
    name: string;  // ← Cambiar de title a name
    boardId: string;
    position: number;
    cards: Card[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Card {
    _id: string;
    title: string;
    description?: string;
    columnId: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
  }