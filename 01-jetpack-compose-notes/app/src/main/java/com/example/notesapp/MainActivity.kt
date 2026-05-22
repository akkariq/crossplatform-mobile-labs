package com.example.notesapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.notesapp.data.NoteDatabase
import com.example.notesapp.data.NoteRepository
import com.example.notesapp.ui.AddEditNoteScreen
import com.example.notesapp.ui.NotesScreen
import com.example.notesapp.ui.NotesViewModel
import com.example.notesapp.ui.NotesViewModelFactory
import com.example.notesapp.ui.theme.NotesAppTheme

class MainActivity : ComponentActivity() {

    private lateinit var noteRepository: NoteRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = NoteDatabase.getDatabase(this)
        noteRepository = NoteRepository(database.noteDao)

        setContent {
            NotesAppTheme {
                NotesApp(noteRepository)
            }
        }
    }
}

@Composable
fun NotesApp(noteRepository: NoteRepository) {
    val navController = rememberNavController()
    val viewModel: NotesViewModel = viewModel(
        factory = NotesViewModelFactory(noteRepository)
    )

    NavHost(
        navController = navController,
        startDestination = "notes_list"
    ) {
        // Экран списка заметок
        composable("notes_list") {
            NotesScreen(
                viewModel = viewModel,
                onNoteClick = { noteId ->
                    // Выполнено Задание C: переход к редактированию с ID
                    navController.navigate("add_edit_note/$noteId")
                },
                onAddClick = {
                    navController.navigate("add_edit_note/-1") // -1 означает создание новой
                }
            )
        }

        // Экран добавления/редактирования заметки (принимает ID)
        composable(
            route = "add_edit_note/{noteId}",
            arguments = listOf(navArgument("noteId") { type = NavType.IntType })
        ) { backStackEntry ->
            val noteId = backStackEntry.arguments?.getInt("noteId") ?: -1

            // Если мы редактируем существующую заметку, загружаем её данные
            LaunchedEffect(noteId) {
                if (noteId != -1) {
                    viewModel.loadNoteById(noteId)
                }
            }

            val currentNote by viewModel.currentNote.collectAsState()

            // Проверяем, открыли создание или редактирование конкретной заметки
            val initialTitle = if (noteId != -1) currentNote?.title ?: "" else ""
            val initialContent = if (noteId != -1) currentNote?.content ?: "" else ""

            AddEditNoteScreen(
                initialTitle = initialTitle,
                initialContent = initialContent,
                onSaveClick = { title, content ->
                    if (noteId == -1) {
                        viewModel.addNote(title, content)
                    } else {
                        // Выполнено Задание C: обновление существующей заметки
                        viewModel.updateNote(noteId, title, content)
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}