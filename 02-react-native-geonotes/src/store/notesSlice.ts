import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { database, DBNote } from '../database/db';

interface NotesState {
  items: DBNote[];
  loading: boolean;
}

const initialState: NotesState = {
  items: [],
  loading: false,
};

// Асинхронный экшен для загрузки заметок из SQLite при старте приложения
export const loadNotesFromDB = createAsyncThunk('notes/loadNotes', async () => {
  return database.getAllNotes();
});

// Асинхронный экшен для сохранения заметки
export const addNoteAsync = createAsyncThunk('notes/addNote', async (note: DBNote) => {
  database.insertNote(note);
  return note;
});

// Асинхронный экшен для удаления заметки
export const deleteNoteAsync = createAsyncThunk('notes/deleteNote', async (id: string) => {
  database.deleteNote(id);
  return id;
});

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Загрузка
      .addCase(loadNotesFromDB.fulfilled, (state, action: PayloadAction<DBNote[]>) => {
        state.items = action.payload;
      })
      // Добавление
      .addCase(addNoteAsync.fulfilled, (state, action: PayloadAction<DBNote>) => {
        state.items.unshift(action.payload);
      })
      // Удаление
      .addCase(deleteNoteAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((note) => note.id !== action.payload);
      });
  },
});

export default notesSlice.reducer;