import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('pk.eyJ1IjoiYnRwdW5jaHkiLCJhIjoiY21vOHh1Z21kMDRnczJxcjBqdG5iM2t0YSJ9.3IT3LGblDnR8m9JU5iCt7g');

const BASE_URL = 'http://localhost:8080';
const { width } = Dimensions.get('window');

type Station = {
  id: number;
  name_en: string;
  name_th: string;
  line: string;
  lat: number;
  lng: number;
};

type Exit = {
  id: number;
  station_id: number;
  exit_number: string;
  description: string;
  lat: number;
  lng: number;
};

export const MapScreen = ({ navigation }: any) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [exits, setExits] = useState<Exit[]>([]);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // ดึง station ทั้งหมดตอนโหลด
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/stations`);
      const data = await res.json();
      setStations(data.stations || []);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  // search station
  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/stations?q=${text}`);
      const data = await res.json();
      setSearchResults(data.stations || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // เลือก station จาก search
  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    setSearch(station.name_en);
    setSearchResults([]);
    fetchExits(station.id);
    // ย้าย camera ไปที่ station
    cameraRef.current?.setCamera({
      centerCoordinate: [station.lng, station.lat],
      zoomLevel: 15,
      animationDuration: 1000,
    });
  };

  // ดึง exits ของ station
  const fetchExits = async (stationId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/station-exits?station_id=${stationId}`);
      const data = await res.json();
      setExits(data.exits || []);
    } catch (error) {
      console.error('Failed to fetch exits:', error);
    }
  };

  // กด station บน map
  const handleStationPress = (station: Station) => {
    setSelectedStation(station);
    fetchExits(station.id);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Map */}
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={12}
          centerCoordinate={[100.5018, 13.7563]} // กรุงเทพ
        />

        {/* Station markers */}
        {stations.map((station) => (
          <MapboxGL.PointAnnotation
            key={`station-${station.id}`}
            id={`station-${station.id}`}
            coordinate={[station.lng, station.lat]}
            onSelected={() => handleStationPress(station)}
          >
            <View style={[
              styles.stationMarker,
              selectedStation?.id === station.id && styles.stationMarkerSelected
            ]} />
          </MapboxGL.PointAnnotation>
        ))}

        {/* Exit markers */}
        {exits.map((exit) => (
          <MapboxGL.PointAnnotation
            key={`exit-${exit.id}`}
            id={`exit-${exit.id}`}
            coordinate={[exit.lng, exit.lat]}
          >
            <View style={styles.exitMarker}>
              <Text style={styles.exitMarkerText}>{exit.exit_number}</Text>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stations"
          placeholderTextColor="#6C757D"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleSelectStation(item)}
              >
                <Text style={styles.searchResultText}>{item.name_en}</Text>
                {item.name_th ? (
                  <Text style={styles.searchResultSubText}>{item.name_th}</Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Station info card */}
      {selectedStation && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{selectedStation.name_en}</Text>
          {selectedStation.name_th ? (
            <Text style={styles.infoSubTitle}>{selectedStation.name_th}</Text>
          ) : null}
          <Text style={styles.infoLine}>Line: {selectedStation.line}</Text>

          {exits.length > 0 && (
            <>
              <Text style={styles.exitsTitle}>Exits:</Text>
              {exits.map((exit) => (
                <Text key={exit.id} style={styles.exitItem}>
                  Exit {exit.exit_number} — {exit.description}
                </Text>
              ))}
            </>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => { setSelectedStation(null); setExits([]); }}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemInset]}>
          <View style={styles.navIconHeart} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemShadow]}>
          <View style={styles.navIconMap} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemShadow]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.navIconProfile} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  map: {
    flex: 1,
  },
  stationMarker: {
    width: 14,
    height: 14,
    backgroundColor: '#E7ECF6',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#000099',
  },
  stationMarkerSelected: {
    backgroundColor: '#3377FF',
    width: 18,
    height: 18,
  },
  exitMarker: {
    width: 22,
    height: 22,
    backgroundColor: '#00F5D4',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitMarkerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000099',
  },
  searchBar: {
    position: 'absolute',
    top: 26,
    left: 22,
    width: 289,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E6EFF7',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
    shadowColor: '#C5D9D5',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#6C757D',
    borderRadius: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#3F487B',
  },
  searchResults: {
    position: 'absolute',
    top: 68,
    left: 22,
    width: 289,
    backgroundColor: '#F0F1F9',
    borderRadius: 12,
    zIndex: 10,
    maxHeight: 200,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchResultText: {
    fontSize: 13,
    color: '#3F487B',
    fontWeight: '500',
  },
  searchResultSubText: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 2,
  },
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#E8EAF6',
    borderRadius: 24,
    padding: 20,
    zIndex: 10,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F487B',
  },
  infoSubTitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  infoLine: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    marginBottom: 8,
  },
  exitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F487B',
    marginBottom: 4,
  },
  exitItem: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  closeButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    width: width - 48,
    height: 66,
    backgroundColor: '#E8EAF6',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  navItem: {
    width: 43,
    height: 43,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemInset: {
    shadowColor: '#C5D9D5',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  navItemShadow: {
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  navIconHeart: {
    width: 19,
    height: 19,
    backgroundColor: '#F78BC9',
    borderRadius: 2,
  },
  navIconMap: {
    width: 17,
    height: 22,
    backgroundColor: '#F78BC9',
    borderRadius: 2,
  },
  navIconProfile: {
    width: 13,
    height: 18,
    backgroundColor: '#F78BC9',
    borderRadius: 2,
  },
});