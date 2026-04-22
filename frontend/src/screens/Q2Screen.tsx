import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export const Q2 = ({ navigation, route }: any) => {
  const { distance } = route.params; // รับค่าจาก Q1
  const [budget, setBudget] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8080/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance, budget, preferred_travel_mode: null}),
      });

      if (response.ok) {
        navigation.navigate('MainTabs');
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      alert('Cannot connect to server');
    }
  };

  // ปุ่ม Next เปลี่ยนเป็น
  // onPress={handleSubmit}

  return (
    <SafeAreaView style={styles.container}>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backArrowLine} />
        <View style={styles.backArrowHead} />
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>

        <Text style={styles.question}>What's your comfortable spending range?</Text>
        <Text style={styles.description}>Budget-friendly for students or ready to splurge?</Text>

        {/* Budget input */}
        <TextInput
          style={styles.input}
          placeholder="1000 Baht"
          placeholderTextColor="#6C757D"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        {/* Next button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
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
    marginBottom: 16,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E6EFF7',
    borderRadius: 20,
    fontSize: 12,
    color: '#3F487B',
    marginBottom: 24,
    shadowColor: '#C5D9D5',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
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