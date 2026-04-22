import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export const Q1 = ({ navigation }: any) => {
  const [distance, setDistance] = useState(500);

  const formatDistance = (value: number) => {
    if (value < 1000) return `${value} m`;
    return `${(value / 1000).toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backArrowLine} />
        <View style={styles.backArrowHead} />
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>

        {/* Question */}
        <Text style={styles.question}>What's your absolute walking limit?</Text>
        <Text style={styles.description}>
          We won't suggest places further than this, no matter how cool they are.
        </Text>

        {/* Distance display */}
        <View style={styles.distanceBox}>
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0 km</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2000}
            step={100}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="#303F9F"
            maximumTrackTintColor="#4E5EBB"
            thumbTintColor="#F3F3F3"
          />
          <Text style={styles.sliderLabel}>2 km</Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Q2', { distance })}
        >
          <Text style={styles.buttonText}>Next</Text>
          <View style={styles.arrowContainer}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowHead} />
          </View>
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 29,
    left: 25,
    width: 29,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrowLine: {
    width: 18,
    height: 2,
    backgroundColor: 'black',
  },
  backArrowHead: {
    width: 8,
    height: 14,
    backgroundColor: 'black',
    position: 'absolute',
    left: 0,
  },
  card: {
    width: width - 48,
    backgroundColor: '#E8EAF6',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3F487B',
    lineHeight: 28,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 16,
    marginBottom: 24,
  },
  distanceBox: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F0F1F9',
    borderRadius: 999,
    marginBottom: 16,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    width: 233,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3F487B',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6C757D',
    width: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  arrowContainer: {
    width: 25,
    height: 14,
    justifyContent: 'center',
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
    left: 4,
  },
  arrowHead: {
    width: 7,
    height: 12,
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
  },
});