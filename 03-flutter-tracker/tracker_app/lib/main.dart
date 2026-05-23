import 'package:flutter/material.dart';

void main() {
  runApp(const FitnessTrackerApp());
}

class FitnessTrackerApp extends StatelessWidget {
  const FitnessTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fitness Tracker',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6750A4),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const TrackerHomeScreen(),
    );
  }
}

class Workout {
  final String id;
  final String title;
  final String type;
  final int duration;
  final DateTime date;

  Workout({
    required this.id,
    required this.title,
    required this.type,
    required this.duration,
    required this.date,
  });
}

class TrackerHomeScreen extends StatefulWidget {
  const TrackerHomeScreen({super.key});

  @override
  State<TrackerHomeScreen> createState() => _TrackerHomeScreenState();
}

class _TrackerHomeScreenState extends State<TrackerHomeScreen> {
  // Основной список тренировок
  final List<Workout> _workouts = [
    Workout(
      id: '1',
      title: 'Тренировка груди и спины',
      type: 'Силовая',
      duration: 60,
      date: DateTime.now().subtract(const Duration(days: 1)),
    ),
    Workout(
      id: '2',
      title: 'Разминка на дорожке',
      type: 'Кардио',
      duration: 15,
      date: DateTime.now(),
    ),
  ];

  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _durationController = TextEditingController();
  String _selectedType = 'Силовая';
  String _selectedFilter = 'Все';

  // Расчет суммарного времени для отфильтрованных записей
  int get _totalDuration {
    return _filteredWorkouts.fold(0, (sum, item) => sum + item.duration);
  }

  // Фильтрация списка на лету
  List<Workout> get _filteredWorkouts {
    if (_selectedFilter == 'Все') {
      return _workouts;
    }
    return _workouts.where((workout) => workout.type == _selectedFilter).toList();
  }

  // Добавление новой тренировки
  void _addWorkout() {
    if (!_formKey.currentState!.validate()) {
      return; 
    }

    final enteredTitle = _titleController.text.trim();
    final enteredDuration = int.parse(_durationController.text);

    setState(() {
      _workouts.insert(
        0,
        Workout(
          id: DateTime.now().toString(),
          title: enteredTitle,
          type: _selectedType, // Берет текущее выбранное значение
          duration: enteredDuration,
          date: DateTime.now(),
        ),
      );
    });

    _titleController.clear();
    _durationController.clear();
    FocusScope.of(context).unfocus();
  }

  // Удаление тренировки
  void _deleteWorkout(String id) {
    setState(() {
      _workouts.removeWhere((workout) => workout.id == id);
    });

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Тренировка удалена'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F5FA),
      appBar: AppBar(
        title: const Text('Workout Tracker ⚡', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Блок 1: Панель общей статистики
            Card(
              elevation: 2,
              color: Theme.of(context).colorScheme.primary,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _selectedFilter == 'Все' ? 'Всего активности' : 'Активность ($_selectedFilter)',
                          style: const TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        const Text('За всё время', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Text(
                      '$_totalDuration мин',
                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Блок 2: Форма ввода с валидацией
            Card(
              elevation: 1,
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Добавить новую активность', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          labelText: 'Название упражнения / тренировки',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Введите название тренировки';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            flex: 2,
                            child: TextFormField(
                              controller: _durationController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Время (мин)',
                                border: OutlineInputBorder(),
                                isDense: true,
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Обязательно';
                                }
                                final num = int.tryParse(value);
                                if (num == null || num <= 0) {
                                  return 'Некорректно';
                                }
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 3,
                            child: DropdownButtonFormField<String>(
                              value: _selectedType,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              ),
                              items: ['Силовая', 'Кардио', 'Растяжка', 'Йога']
                                  .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                                  .toList(),
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() {
                                    _selectedType = value; // Мгновенно обновляет выбранный тип
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: _addWorkout,
                        icon: const Icon(Icons.add),
                        label: const Text('Зафиксировать тренировку'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                          foregroundColor: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Блок 3: Фильтры (ChoiceChips)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['Все', 'Силовая', 'Кардио', 'Растяжка', 'Йога'].map((filterName) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(filterName),
                      selected: _selectedFilter == filterName,
                      onSelected: (isSelected) {
                        if (isSelected) {
                          setState(() {
                            _selectedFilter = filterName;
                          });
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),

            // Блок 4: Заголовок истории
            const Row(
              children: [
                Icon(Icons.history, color: Colors.grey),
                SizedBox(width: 8),
                Text('История тренировок', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
              ],
            ),
            const SizedBox(height: 8),

            // Блок 5: Динамический список
            Expanded(
              child: _filteredWorkouts.isEmpty
                  ? const Center(child: Text('Нет тренировок в этой категории.'))
                  : ListView.builder(
                      itemCount: _filteredWorkouts.length,
                      itemBuilder: (context, index) {
                        final workout = _filteredWorkouts[index];
                        
                        IconData itemIcon = Icons.fitness_center;
                        if (workout.type == 'Кардио') itemIcon = Icons.directions_run;
                        if (workout.type == 'Растяжка' || workout.type == 'Йога') itemIcon = Icons.accessibility_new;

                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          color: Colors.white,
                          elevation: 0.5,
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                              child: Icon(itemIcon, color: Theme.of(context).colorScheme.primary),
                            ),
                            title: Text(workout.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('${workout.type} • ${_formatDate(workout.date)}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '${workout.duration} мин',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                  onPressed: () => _deleteWorkout(workout.id),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}';
  }
}