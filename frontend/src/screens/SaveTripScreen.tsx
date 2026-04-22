import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const BASE_URL = 'http://localhost:8080';

// ─── Types ───────────────────────────────────────────────
type Trip = {
  id: number | string;
  name: string;
  imageUrl?: string;
  walkingLimit?: number;
  budget?: number;
};

type TabKey = 'map' | 'planner' | 'savePlan';

// ─── API ─────────────────────────────────────────────────
const api = {
  getTrips: async (): Promise<Trip[]> => {
    const res = await fetch(`${BASE_URL}/trips`);
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },
  deleteTrip: async (tripId: number | string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tripId }),
    });
    if (!res.ok) throw new Error('Failed to delete trip');
  },
};

// ─── Trip Card ───────────────────────────────────────────
type TripCardProps = {
  item: Trip;
  onDelete: (id: number | string) => void;
};

const TripCard = ({ item, onDelete }: TripCardProps) => {
  const handleDelete = () => {
    Alert.alert('Delete Trip', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl ?? 'https://placehold.co/160x113' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardMeta}>🚶 Walking Limit {item.walkingLimit ?? 500} m</Text>
        <Text style={styles.cardMeta}>💰 Budget {item.budget ?? 500} Baht</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Bottom Tab Bar ──────────────────────────────────────
const TAB_ITEMS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'map',      label: 'Map',        icon: '🗺️' },
  { key: 'planner',  label: 'AI Planner', icon: '✨' },
  { key: 'savePlan', label: 'Save Plan',  icon: '📌' },
];

type BottomTabBarProps = {
  activeTab: TabKey;
  onTabPress: (key: TabKey) => void;
};

const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => (
  <View style={styles.tabBar}>
    {TAB_ITEMS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Main Screen ─────────────────────────────────────────
export default function SavedTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('savePlan');

  const fetchTrips = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (tripId: number | string) => {
    try {
      await api.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8EAF6" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Trips</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3F51B5" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No saved trips yet</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TripCard item={item} onDelete={handleDelete} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchTrips(true)}
          refreshing={refreshing}
        />
      )}

      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#E8EAF6' },
  header:       { paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle:  { fontSize: 22, fontWeight: '700', color: '#101828' },
  listContent:  { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 24,
    height: 113,
    overflow: 'hidden',
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: 160,
    height: 113,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle:      { fontSize: 16, fontWeight: '600', color: '#101828', marginBottom: 4 },
  cardMeta:       { fontSize: 12, fontWeight: '500', color: '#6C757D', lineHeight: 16 },
  deleteBtn:      { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14 },
  deleteBtnText:  { fontSize: 16, color: '#6C757D' },

  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:      { fontSize: 14, color: '#6C757D' },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#E8EAF6',
    borderRadius: 50,
    paddingVertical: 10,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 2 },
  tabIcon:        { fontSize: 20, opacity: 0.5 },
  tabIconActive:  { opacity: 1 },
  tabLabel:       { fontSize: 10, fontWeight: '500', color: '#6C757D' },
  tabLabelActive: { color: '#3F51B5', fontWeight: '700' },
});