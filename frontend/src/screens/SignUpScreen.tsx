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

export const SignUpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.navigate('Q1');
      } else {
        alert(data.message || 'Sign up failed');
      }
    } catch (error) {
      alert('Cannot connect to server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Logo icon */}
      <View style={styles.logoArea}>
        <View style={styles.logoBack} />
        <View style={styles.logoFront} />
        <View style={styles.logoLineLeft} />
        <View style={styles.logoLineRight1} />
        <View style={styles.logoLineRight2} />
        <View style={styles.logoWindow} />
        <View style={styles.logoDot} />
      </View>

      {/* Circle decoration */}
      <View style={styles.circleBig} />
      <View style={styles.circleSmallGreen} />

      {/* Train shape inside circle */}
      <View style={styles.trainShape} />

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6C757D"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6C757D"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Confirm Password */}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#6C757D"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Create Account Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>Create Account</Text>
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

  // Logo
  logoArea: {
    width: 60,
    height: 60,
    marginTop: 24,
    alignSelf: 'flex-start',
    marginLeft: 33,
  },
  logoBack: {
    position: 'absolute',
    width: 17,
    height: 28,
    left: 4,
    top: 0,
    backgroundColor: '#5C6BC0',
    opacity: 0.4,
  },
  logoFront: {
    position: 'absolute',
    width: 17,
    height: 28,
    left: 0,
    top: 3,
    backgroundColor: '#3F51B5',
  },
  logoLineLeft: {
    position: 'absolute',
    width: 3,
    height: 32,
    left: 0,
    top: 6,
    backgroundColor: '#12102A',
    opacity: 0.6,
  },
  logoLineRight1: {
    position: 'absolute',
    width: 3,
    height: 9,
    left: 11,
    top: 6,
    backgroundColor: '#12102A',
    opacity: 0.8,
  },
  logoLineRight2: {
    position: 'absolute',
    width: 3,
    height: 9,
    left: 11,
    top: 17,
    backgroundColor: '#12102A',
    opacity: 0.8,
  },
  logoWindow: {
    position: 'absolute',
    width: 19,
    height: 8,
    left: 4,
    top: 13,
    borderWidth: 2,
    borderColor: '#00F5D4',
  },
  logoDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    left: 22,
    top: 12,
    backgroundColor: 'white',
  },

  // Circle decorations
  circleBig: {
    position: 'absolute',
    width: 323,
    height: 323,
    top: 100,
    borderRadius: 999,
    backgroundColor: '#E6F0F7',
    shadowColor: '#C5D9D5',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  circleSmallGreen: {
    position: 'absolute',
    width: 108,
    height: 108,
    top: 397,
    right: 0,
    borderRadius: 999,
    backgroundColor: '#00F5D4',
    shadowColor: '#00C9AD',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainShape: {
    position: 'absolute',
    width: 112,
    height: 152,
    top: 153,
    left: 124,
    borderRadius: 8,
    backgroundColor: '#3F51B5',
    shadowColor: '#263694',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Card
  card: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 393,
    backgroundColor: '#E8EAF6',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    paddingHorizontal: 39,
    paddingTop: 32,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3F487B',
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
    marginBottom: 12,
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
    alignItems: 'center',
    marginTop: 4,
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
});