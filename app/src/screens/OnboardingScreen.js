import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { colors, radius, spacing } from '../theme';
import { setHasOnboarded } from '../utils/storage';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 20, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAllow = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      await setHasOnboarded();
      navigation.replace('Main');
    } else {
      Alert.alert(
        'Permission Required',
        'Screenshot Memory needs photo library access to detect and organize your screenshots.',
        [
          {
            text: 'Skip for Now',
            onPress: async () => {
              await setHasOnboarded();
              navigation.replace('Main');
            },
          },
          { text: 'OK' },
        ]
      );
    }
  };

  const handleSkip = async () => {
    await setHasOnboarded();
    navigation.replace('Main');
  };

  const animIn = () =>
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const animOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Radial glow background */}
      <View style={styles.bgGlow} />

      <Animated.View
        style={[
          styles.inner,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Illustration ── */}
        <View style={styles.illustrationWrapper}>
          {/* Back card — rotated left */}
          <View style={styles.cardBack}>
            <Image
              source={require('../../assets/image.png')}
              style={styles.cardBackImage}
              resizeMode="cover"
            />
          </View>

          {/* Front card — rotated right, contains sparkle icon */}
          <View style={styles.cardFront}>
            <Ionicons name="sparkles" size={64} color="#ffffff" />
          </View>
        </View>

        {/* ── Headline ── */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Your screenshots,{'\n'}finally organized</Text>
          <Text style={styles.subtitle}>
            Memory uses AI to automatically categorize and extract info from your screenshots.
          </Text>
        </View>

        {/* ── Feature cards ── */}
        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Ionicons name="search-outline" size={24} color="#ffffff" />
            <Text style={styles.featureLabel}>Smart Search</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="pricetag-outline" size={24} color="#ffffff" />
            <Text style={styles.featureLabel}>Auto Tags</Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleAllow}
              onPressIn={animIn}
              onPressOut={animOut}
              activeOpacity={1}
            >
              <Text style={styles.primaryBtnText}>Allow Access</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Not now</Text>
          </TouchableOpacity>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={12} color="rgba(255,255,255,0.3)" />
            <Text style={styles.privacyText}>
              PRIVACY FIRST: ANALYSIS HAPPENS ON-DEVICE
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const CARD_W = 192;
const CARD_H = 256;
const CARD_RADIUS = 32;
const GLASS_BG = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bgGlow: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '120%',
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    opacity: 0.2,
  },
  inner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },

  // ── Illustration ──
  illustrationWrapper: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 32,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    left: 16,
    top: 0,
    transform: [{ rotate: '-6deg' }],
    overflow: 'hidden',
    opacity: 0.65,
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  cardFront: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 32,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    right: 16,
    top: 16,
    transform: [{ rotate: '6deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ── Text ──
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  // ── Features ──
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },

  // ── Actions ──
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f0f0f',
  },
  secondaryBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default OnboardingScreen;