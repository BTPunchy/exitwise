import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export const LandingScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>

      {/* Logo icon (train shape) */}
      <View style={styles.logoArea}>
        <View style={styles.logoBack} />
        <View style={styles.logoFront} />
        <View style={styles.logoLineLeft} />
        <View style={styles.logoLineRight1} />
        <View style={styles.logoLineRight2} />
        <View style={styles.logoWindow} />
        <View style={styles.logoDot} />
      </View>

      {/* Subtitle pill */}
      <View style={styles.subtitlePill}>
        <Text style={styles.subtitleText}>Subtitle</Text>
      </View>

      {/* Ellipse blur decoration */}
      <View style={styles.ellipse} />

      {/* Train placeholder image */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>🚆</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* App name */}
        <Text style={styles.appName}>ExitWise</Text>

        {/* Description */}
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget
          ante tristique, lacinia arcu tempor, porta metus. Vestibulum fringilla
          gravida metus eu fermentum. Proin elementum nibh eget nulla auctor
          tincidunt.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
  },

  // Logo
  logoArea: {
    width: 60,
    height: 60,
    marginTop: 24,
    alignSelf: 'flex-start',
    marginLeft: 36,
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

  // Subtitle pill
  subtitlePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F0F1F9',
    borderRadius: 999,
    marginTop: 16,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  subtitleText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
  },

  // Ellipse decoration
  ellipse: {
    position: 'absolute',
    width: 412,
    height: 130,
    top: 242,
    left: 11,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 84, 142, 0.10)',
    transform: [{ rotate: '11deg' }],
  },

  // Image placeholder (แทนรูป skytrain)
  imagePlaceholder: {
    width: 300,
    height: 180,
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },

  // Card
  card: {
    width: width - 48,
    marginTop: 24,
    backgroundColor: '#E8EAF6',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3F487B',
    lineHeight: 48,
  },
  description: {
    marginTop: 12,
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  signUpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3F51B5',
    borderRadius: 9,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  signUpText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F1F9',
    borderRadius: 9,
    shadowColor: '#C5C7D1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  loginText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
});