import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { addNoteAsync } from '../store/notesSlice';
import 'react-native-get-random-values'; // Полифил для генерации UUID в React Native
import { v4 as uuidv4 } from 'uuid';

interface AddNoteScreenProps {
  navigation: any;
}

export default function AddNoteScreen({ navigation }: AddNoteScreenProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // При открытии экрана сразу берём текущую геопозицию
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нет доступа к геолокации. Мы не сможем сохранить координаты.');
        setLoadingLocation(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось определить точные координаты.');
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // Функция запуска камеры устройства
  const takePhoto = async () => {
    // Запрашиваем права на камеру
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужен доступ к камере, чтобы сделать снимок места.');
      return;
    }

    // Открываем системную камеру
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, // Дать юзеру возможность обрезать фото перед сохранением
      aspect: [4, 3],
      quality: 0.7, // Слегка сжимаем качество, чтобы база данных летала
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Внимание', 'Заполните название и описание гео-заметки.');
      return;
    }

    if (!coords) {
      Alert.alert('Ошибка', 'Координаты еще не определены. Подождите секунду.');
      return;
    }

    // Собираем объект для базы данных
    const newNote = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      imageUri: imageUri,
      createdAt: Date.now()
    };

    // Отправляем в Redux + SQLite асинхронно
    dispatch(addNoteAsync(newNote));
    
    // Возвращаемся назад на экран списка
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Название места</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Например: Любимая кофейня" 
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Описание / Впечатления</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Опишите это место..." 
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Геолокация</Text>
      {loadingLocation ? (
        <View style={styles.geoRow}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.geoText}> Считываем GPS координаты...</Text>
        </View>
      ) : coords ? (
        <Text style={styles.geoSuccessText}>
          📍 Широта: {coords.latitude.toFixed(6)}, Долгота: {coords.longitude.toFixed(6)}
        </Text>
      ) : (
        <Text style={styles.geoErrorText}>Не удалось получить координаты</Text>
      )}

      <Text style={styles.label}>Фотография места</Text>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.retakeButton} onPress={takePhoto}>
            <Text style={styles.retakeButtonText}>Переснять фото</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoPlaceholder} onPress={takePhoto}>
          <Text style={styles.photoPlaceholderText}>📷 Сделать снимок места</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Сохранить гео-заметку</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  geoText: {
    fontSize: 15,
    color: '#666',
  },
  geoSuccessText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  geoErrorText: {
    fontSize: 15,
    color: '#FF3B30',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    backgroundColor: '#E5E5EA',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#A2A2A6',
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  retakeButton: {
    backgroundColor: '#8E8E93',
    padding: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});