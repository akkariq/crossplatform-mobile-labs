import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { store } from './src/store';
import { loadNotesFromDB } from './src/store/notesSlice';
import { initDatabase } from './src/database/db';

import NotesListScreen from './src/screens/NotesListScreen';
import MapScreen from './src/screens/MapScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Стак-навигатор для первой вкладки (Список заметок -> Экран добавления)
function NotesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="NotesList" 
        component={NotesListScreen} 
        options={{ title: 'Мои гео-заметки' }}
      />
      <Stack.Screen 
        name="AddNote" 
        component={AddNoteScreen} 
        options={{ title: 'Новое место' }}
      />
    </Stack.Navigator>
  );
}

// Главная нижняя панель навигации (Tabs)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          // Простые текстовые иконки-эмодзи, чтобы не утяжелять проект сторонними шрифтами
          if (route.name === 'ListTab') {
            return <Text style={{ fontSize: 20 }}>{focused ? '📝' : '📄'}</Text>;
          } else if (route.name === 'MapTab') {
            return <Text style={{ fontSize: 20 }}>{focused ? '🗺️' : '🧭'}</Text>;
          }
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false, // Отключаем верхний заголовок табов, так как он есть внутри стака
      })}
    >
      <Tab.Screen 
        name="ListTab" 
        component={NotesStack} 
        options={{ title: 'Список' }}
      />
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen} 
        options={{ title: 'Карта' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // 1. Инициализируем SQLite базу данных на устройстве
    initDatabase();
    // 2. Сразу же выкачиваем все сохраненные ранее заметки в Redux
    store.dispatch(loadNotesFromDB());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}