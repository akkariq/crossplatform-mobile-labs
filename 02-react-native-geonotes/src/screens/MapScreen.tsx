import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function MapScreen() {
  const notes = useSelector((state: RootState) => state.notes.items);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Запрашиваем разрешение на доступ к геолокации устройства
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Разрешение на доступ к геолокации было отклонено');
        return;
      }

      // Получаем текущие координаты айфона
      let currentItem = await Location.getCurrentPositionAsync({});
      setLocation(currentItem);
    })();
  }, []);

  // Пока координаты телефона загружаются, крутим красивый лоадер
  if (!location && !errorMsg) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Определяем геопозицию...</Text>
      </View>
    );
  }

  // Если юзер запретил геопозицию в настройках телефона
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  // Начальная точка фокуса карты (твое местоположение)
  const initialRegion = {
    latitude: location?.coords.latitude || 55.7558,
    longitude: location?.coords.longitude || 37.6173,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={true} // Синяя точка твоего реального положения на карте
      >
        {/* Рендерим маркеры из Redux стейта */}
        {notes.map((note) => (
          <Marker
            key={note.id}
            coordinate={{ latitude: note.latitude, longitude: note.longitude }}
            pinColor="#FF3B30"
          >
            {/* Всплывающее превью при нажатии на маркер */}
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                {note.imageUri && (
                  <Image source={{ uri: note.imageUri }} style={styles.calloutImage} />
                )}
                <Text style={styles.calloutTitle}>{note.title}</Text>
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {note.description}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});