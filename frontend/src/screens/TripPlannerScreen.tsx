// screens/TripPlanScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stop {
  name: string;
  distance: string;
  imageUrl?: string;
}

interface ItineraryResponse {
  title: string;
  summary: string;
  stops: Stop[];
}

type Props = {
  navigation: NavigationProp<any>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:8080"; // เปลี่ยนเป็น IP จริงบน device

const COLORS = {
  bg: "#E4F5F8",
  surface: "#E8EAF6",
  primary: "#3F51B5",
  primaryLight: "#5C6BC0",
  text: "#3F487B",
  subtext: "#4A5565",
  pink: "#F15BB5",
  shadow: "#C5C7D1",
  white: "#ffffff",
};

// ─── API ──────────────────────────────────────────────────────────────────────

async function generateItinerary(prompt: string): Promise<ItineraryResponse> {
  const res = await fetch(`${API_BASE}/generate-itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── StopCard ─────────────────────────────────────────────────────────────────

function StopCard({ stop, index }: { stop: Stop; index: number }) {
  const isFirst = index === 0;

  return (
    <View style={styles.stopRow}>
      {isFirst ? (
        <View style={[styles.avatar, styles.avatarActive]}>
          <Text style={styles.avatarIcon}>🏠</Text>
        </View>
      ) : (
        <Image
          source={{ uri: stop.imageUrl ?? "https://placehold.co/48x48" }}
          style={[styles.avatar, styles.avatarImage]}
        />
      )}
      <View style={styles.stopInfo}>
        <Text style={styles.stopName}>{stop.name}</Text>
        {stop.distance ? (
          <Text style={styles.stopDistance}>{stop.distance}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TripPlanScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateItinerary("Plan a trip around Ari, Bangkok");
      setPlan(result);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const displayPlan: ItineraryResponse = plan ?? {
    title: "Ari Trip Plan",
    summary: "~1.1 km · Approximately 3 hours",
    stops: [
      { name: "Leave Exit 3", distance: "" },
      { name: "The Coffee Club", distance: "200 m" },
      { name: "Paa Noi Boat Noodle", distance: "600 m" },
      { name: "Ari Market", distance: "900 m" },
    ],
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{displayPlan.title}</Text>
        <Text style={styles.headerSub}>{displayPlan.summary}</Text>
      </View>

      {/* ── Card ── */}
      <View style={styles.card}>
        <ScrollView
          style={styles.stopList}
          contentContainerStyle={styles.stopListContent}
          showsVerticalScrollIndicator={false}
        >
          {displayPlan.stops.map((stop, i) => (
            <StopCard key={i} stop={stop} index={i} />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => Alert.alert("Saved", "Plan saved!")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Save Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => Alert.alert("Edit", "Edit mode coming soon")}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>Edit Plan</Text>
        </TouchableOpacity>
      </View>

      {/* ── Generate ── */}
      <TouchableOpacity
        style={styles.generateBtn}
        onPress={handleGenerate}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.generateBtnText}>✨ Generate New Plan</Text>
        )}
      </TouchableOpacity>

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemShadow]}
          onPress={() => navigation.navigate("Map")}
          activeOpacity={0.8}
        >
          <View style={styles.navIconHeart} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemShadow]}
          onPress={() => navigation.navigate("Map")}
          activeOpacity={0.8}
        >
          <View style={styles.navIconMap} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemInset]}
          onPress={() => navigation.navigate("SaveTrip")}
          activeOpacity={0.8}
        >
          <View style={styles.navIconProfile} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSub: {
    color: COLORS.subtext,
    fontSize: 14,
    textAlign: "center",
  },

  // Card
  card: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.white,
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  stopList: {
    flex: 1,
  },
  stopListContent: {
    paddingBottom: 8,
  },

  // Stop row
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarActive: {
    backgroundColor: COLORS.primaryLight,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.25)",
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  avatarImage: {
    ...Platform.select({
      ios: {
        shadowColor: "#ADB5BD",
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  avatarIcon: {
    fontSize: 22,
  },
  stopInfo: {
    marginLeft: 16,
    flex: 1,
  },
  stopName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  stopDistance: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: COLORS.pink,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  btnSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // Generate button
  generateBtn: {
    marginHorizontal: 24,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  generateBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 50,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  navItem: {
    width: 43,
    height: 43,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  navItemShadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  navItemInset: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: { elevation: 0 },
    }),
  },

  // Nav Icons (placeholder shapes — swap กับ vector icons ได้เลย)
  navIconHeart: {
    width: 22,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  navIconMap: {
    width: 18,
    height: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  navIconProfile: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});