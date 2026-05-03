import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { colors, radius, spacing } from '../theme';
import { setHasOnboarded } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🖼️', title: 'Auto-Organizes', desc: 'AI reads every screenshot and sorts it by category automatically.' },
  { icon: '🔍', title: 'Searchable', desc: 'Find any screenshot instantly by searching its content or tags.' },
  { icon: '✨', title: 'Smart Summaries', desc: 'See a one-line summary of each screenshot without opening it.' },
];

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
      navigation.replace('Home');
    } else {
      Alert.alert(
        'Permission Required',
        'Screenshot Memory needs photo library access to detect and organize your screenshots. Please enable it in Settings.',
        [
          { text: 'Skip for Now', onPress: async () => { await setHasOnboarded(); navigation.replace('Home'); } },
          { text: 'OK' },
        ]
      );
    }
  };

  const animIn = () =>
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const animOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={styles.container}>
      {/* Background orb decorations */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo / Icon area */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>📸</Text>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>AI</Text>
          </View>
        </View>

        <Text style={styles.title}>Screenshot{'\n'}Memory</Text>
        <Text style={styles.subtitle}>
          Your screenshots, automatically organized{'\n'}and made searchable with AI.
        </Text>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleAllow}
            onPressIn={animIn}
            onPressOut={animOut}
            activeOpacity={1}
          >
            <Text style={styles.buttonText}>Allow Photo Access</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.legalNote}>
          Used only to detect new screenshots.{'\n'}Nothing is shared without your knowledge.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent,
    opacity: 0.08,
    top: -80,
    right: -80,
  },
  orb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#9C27B0',
    opacity: 0.06,
    bottom: 40,
    left: -60,
  },
  content: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  logoEmoji: {
    fontSize: 42,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  logoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl + 8,
  },
  features: {
    width: '100%',
    marginBottom: spacing.xl + 8,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 22,
  },
  featureText: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  legalNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OnboardingScreen;
