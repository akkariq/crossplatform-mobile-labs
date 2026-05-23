import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { deleteNoteAsync } from '../store/notesSlice';

// Интерфейс пропсов навигации, чтобы кнопка умела переключать экраны
interface NotesListScreenProps {
  navigation: any;
}

export default function NotesListScreen({ navigation }: NotesListScreenProps) {
  const notes = useSelector((state: RootState) => state.notes.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = (id: string) => {
    dispatch(deleteNoteAsync(id));
  };

  // Красивое форматирование даты
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {notes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>У вас пока нет гео-заметок.</Text>
          <Text style={styles.subEmptyText}>Нажмите кнопку ниже, чтобы создать первую!</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUri && (
                <Image source={{ uri: item.imageUri }} style={styles.image} />
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  {/* Простая кастомная текстовая кнопка удаления вместо тяжелых библиотек иконок */}
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  <Text style={styles.geo}>
                    📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Большая нижняя кнопка добавления */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddNote')}
      >
        <Text style={styles.fabText}>+ Добавить гео-заметку</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subEmptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 90, // Отступ снизу, чтобы кнопка FAB не перекрывала последнюю карточку
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#3A3A3C',
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  geo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});