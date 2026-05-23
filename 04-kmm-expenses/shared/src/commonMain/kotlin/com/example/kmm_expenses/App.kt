package com.example.kmm_expenses

import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Компоненты Material 3
import androidx.compose.material3.Scaffold
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults

enum class ExpenseCategory(val displayName: String) {
    FOOD("Еда"),
    TRANSPORT("Транспорт"),
    ENTERTAINMENT("Развлечения"),
    OTHER("Другое")
}

data class Expense(
    val id: Long = System.currentTimeMillis(),
    val title: String,
    val amount: Double,
    val category: ExpenseCategory
)

@Composable
fun App() {
    var expenses by remember { mutableStateOf(listOf<Expense>()) }

    var titleInput by remember { mutableStateOf("") }
    var amountInput by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(ExpenseCategory.FOOD) }
    var errorMessage by remember { mutableStateOf("") }

    MaterialTheme {
        Scaffold { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .statusBarsPadding() // Сдвигает весь UI ниже системной строки и челки камеры
                    .padding(16.dp)
            ) {
                Text(
                    text = "Трекер расходов (KMM)",
                    fontSize = 24.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // --- ФОРМА ДОБАВЛЕНИЯ ---
                Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Добавить новый расход",
                            fontSize = 18.sp,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )

                        OutlinedTextField(
                            value = titleInput,
                            onValueChange = { titleInput = it },
                            label = { Text("Название (например, Обед)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = amountInput,
                            onValueChange = { amountInput = it },
                            label = { Text("Сумма") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(text = "Категория:", fontSize = 14.sp)
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            ExpenseCategory.values().forEach { category ->
                                Button(
                                    onClick = { selectedCategory = category },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (selectedCategory == category) MaterialTheme.colorScheme.primary else Color.Gray,
                                        contentColor = Color.White
                                    ),
                                    modifier = Modifier.weight(1f).padding(horizontal = 2.dp)
                                ) {
                                    Text(text = category.displayName, fontSize = 10.sp)
                                }
                            }
                        }

                        if (errorMessage.isNotEmpty()) {
                            Text(
                                text = errorMessage,
                                color = Color.Red,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = {
                                val parsedAmount = amountInput.toDoubleOrNull()
                                if (titleInput.isBlank()) {
                                    errorMessage = "Введите название расхода"
                                } else if (parsedAmount == null || parsedAmount <= 0) {
                                    errorMessage = "Введите корректную сумму больше 0"
                                } else {
                                    expenses = expenses + Expense(
                                        title = titleInput,
                                        amount = parsedAmount,
                                        category = selectedCategory
                                    )
                                    titleInput = ""
                                    amountInput = ""
                                    errorMessage = ""
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Добавить")
                        }
                    }
                }

                // --- СПИСОК РАСХОДОВ ---
                Text(text = "История трат", fontSize = 18.sp, modifier = Modifier.padding(bottom = 8.dp))

                if (expenses.isEmpty()) {
                    Text(text = "Список пока пуст. Добавьте первый расход выше.", color = Color.Gray)
                } else {
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(expenses, key = { it.id }) { expense ->
                            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(text = expense.title, fontSize = 16.sp)
                                        Text(text = expense.category.displayName, fontSize = 12.sp, color = Color.Gray)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "${expense.amount} руб.",
                                            fontSize = 16.sp,
                                            modifier = Modifier.padding(end = 8.dp)
                                        )
                                        Button(
                                            onClick = { expenses = expenses.filter { it.id != expense.id } },
                                            colors = ButtonDefaults.buttonColors(containerColor = Color.Red, contentColor = Color.White),
                                            modifier = Modifier.padding(start = 8.dp)
                                        ) {
                                            Text("X", fontSize = 12.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}