import * as SQLite from 'expo-sqlite';

// Открываем или создаем базу данных geonotes.db
const db = SQLite.openDatabaseSync('geonotes.db');

export interface DBNote {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUri: string | null;
  createdAt: number;
}

export const initDatabase = (): void => {
  // Создаем таблицу заметок, если её еще нет
  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      imageUri TEXT,
      createdAt INTEGER NOT NULL
    );
  `);
};

export const database = {
  // Получить все заметки из базы
  getAllNotes: (): DBNote[] => {
    return db.getAllSync<DBNote>('SELECT * FROM notes ORDER BY createdAt DESC;');
  },

  // Сохранить новую заметку
  insertNote: (note: DBNote): void => {
    db.runSync(
      'INSERT INTO notes (id, title, description, latitude, longitude, imageUri, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [note.id, note.title, note.description, note.latitude, note.longitude, note.imageUri, note.createdAt]
    );
  },

  // Удалить заметку по ID
  deleteNote: (id: string): void => {
    db.runSync('DELETE FROM notes WHERE id = ?;', [id]);
  }
};