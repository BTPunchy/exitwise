import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://localhost:8080';

export const ProfileScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user/profile`);
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTravelMode = async (mode: string) => {
    try {
      await fetch(`${BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_travel_mode: mode }),
      });
      setProfile({ ...profile, preferred_travel_mode: mode });
    } catch (error) {
      console.error('Failed to update travel mode:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Profile avatar */}
      <View style={styles.profileImageContainer}>
        <Text style={styles.profileInitial}>
          {profile?.username?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>

      {/* Username */}
      <Text style={styles.username}>{profile?.username || 'User'}</Text>
      <Text style={styles.email}>{profile?.email || ''}</Text>

      {/* Walking Distance card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Question1')}
      >
        <View>
          <Text style={styles.cardLabel}>Walking Distance Limit</Text>
          <Text style={styles.cardValue}>
            {profile?.absolute_walking_limit >= 1000
              ? `${profile.absolute_walking_limit / 1000} km`
              : `${profile?.absolute_walking_limit ?? 500} m`}
          </Text>
        </View>
        <View style={styles.chevron} />
      </TouchableOpacity>

      {/* Budget card */}
      <TouchableOpacity
        style={[styles.card, { marginTop: 16 }]}
        onPress={() => navigation.navigate('Question2')}
      >
        <View>
          <Text style={styles.cardLabel}>Budget</Text>
          <Text style={styles.cardValue}>
            {profile?.budget_range ?? 500} Baht
          </Text>
        </View>
        <View style={styles.chevron} />
      </TouchableOpacity>

      {/* Travel mode */}
      <Text style={styles.travelModeTitle}>Travel mode</Text>
      <View style={styles.travelModeRow}>

        {/* Lazy */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            profile?.preferred_travel_mode === 'lazy'
              ? styles.modeCardDark
              : styles.modeCardLight,
          ]}
          onPress={() => updateTravelMode('lazy')}
        >
          <View style={styles.modeIconPlaceholder} />
          <Text style={
            profile?.preferred_travel_mode === 'lazy'
              ? styles.modeCardTitleLight
              : styles.modeCardTitleDark
          }>Lazy</Text>
          <Text style={
            profile?.preferred_travel_mode === 'lazy'
              ? styles.modeCardSubLight
              : styles.modeCardSubDark
          }>Closest picks</Text>
        </TouchableOpacity>

        {/* Explorer */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            profile?.preferred_travel_mode === 'explorer'
              ? styles.modeCardDark
              : styles.modeCardLight,
          ]}
          onPress={() => updateTravelMode('explorer')}
        >
          <View style={styles.explorerIcon}>
            <View style={styles.explorerIconBox} />
            <View style={styles.explorerIconBottom} />
          </View>
          <Text style={
            profile?.preferred_travel_mode === 'explorer'
              ? styles.modeCardTitleLight
              : styles.modeCardTitleDark
          }>Explorer</Text>
          <Text style={
            profile?.preferred_travel_mode === 'explorer'
              ? styles.modeCardSubLight
              : styles.modeCardSubDark
          }>More stops & fun</Text>
        </TouchableOpacity>

      </View>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, styles.navItemShadow]}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.navIconHeart} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.navItemShadow]}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.navIconMap} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.navItemInset]}
            onPress={() => navigation.navigate('SaveTrip')}
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
    alignItems: 'center',
  },
  profileImageContainer: {
    marginTop: 54,
    width: 131,
    height: 131,
    borderRadius: 999,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  username: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#3F487B',
  },
  email: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  card: {
    width: width - 50,
    height: 94,
    backgroundColor: '#E8EAF6',
    borderRadius: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F487B',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C6BC0',
    marginTop: 4,
  },
  chevron: {
    width: 7,
    height: 12,
    backgroundColor: '#3F487B',
    borderRadius: 2,
  },
  travelModeTitle: {
    alignSelf: 'flex-start',
    marginLeft: 28,
    marginTop: 32,
    fontSize: 24,
    fontWeight: '600',
    color: '#3F487B',
  },
  travelModeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  modeCard: {
    width: 157,
    height: 133,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeCardDark: {
    backgroundColor: '#3F487B',
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  modeCardLight: {
    backgroundColor: '#E8EAF6',
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  modeIconPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    marginBottom: 8,
    opacity: 0.3,
  },
  modeCardTitleLight: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E8EAF6',
  },
  modeCardSubLight: {
    fontSize: 14,
    color: '#E8EAF6',
    opacity: 0.8,
  },
  modeCardTitleDark: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3F487B',
  },
  modeCardSubDark: {
    fontSize: 14,
    color: '#5C6BC0',
  },
  explorerIcon: {
    width: 53,
    height: 53,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  explorerIconBox: {
    width: 44,
    height: 27,
    borderWidth: 2,
    borderColor: '#3F487B',
    borderRadius: 2,
  },
  explorerIconBottom: {
    width: 44,
    height: 4,
    borderWidth: 2,
    borderColor: '#3F487B',
    borderRadius: 2,
    marginTop: 2,
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
    backgroundColor: '#3F51B5',
    borderRadius: 2,
  },
  navIconMap: {
    width: 17,
    height: 22,
    backgroundColor: '#3F51B5',
    borderRadius: 2,
  },
  navIconProfile: {
    width: 13,
    height: 18,
    borderRadius: 2,
  },
});