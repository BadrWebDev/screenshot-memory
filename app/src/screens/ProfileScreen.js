import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useScreenshotStore from '../store/useScreenshotStore';
import { deleteAllScreenshots } from '../services/api';
import { colors, spacing, typography, radius } from '../theme';

const logoSource = require('../../assets/icon.png');
const PREFERENCES = [
  { label: 'Notifications', icon: 'bell', type: 'feather' },
  { label: 'Auto-sync', icon: 'sync', type: 'material' },
  { label: 'Storage', icon: 'cloud', type: 'feather' },
  { label: 'Privacy', icon: 'lock', type: 'feather' },
  { label: 'About', icon: 'information-circle-outline', type: 'ionicons' },
];

const PreferenceIcon = ({ type, icon }) => {
  if (type === 'material') {
    return <MaterialCommunityIcons name={icon} size={20} color={colors.text} />;
  }

  if (type === 'ionicons') {
    return <Ionicons name={icon} size={22} color={colors.text} />;
  }

  return <Feather name={icon} size={19} color={colors.text} />;
};

const ProfileScreen = ({ navigation }) => {
  const { screenshots, clearScreenshots } = useScreenshotStore();
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;

  const screenshotCount = screenshots.length;
  const categoryCount = new Set(
    screenshots.map((item) => item.category || 'Other')
  ).size;

  const handleSettingPress = (label) => {
    if (label === 'About') {
      Alert.alert('About', 'Memory v1.0.0 - AI-powered screenshot organizer');
      return;
    }
    Alert.alert('Coming soon', 'Coming soon');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Are you sure?',
      'This will permanently delete all your screenshots.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllScreenshots();
              clearScreenshots();
              navigation.navigate('Home');
            } catch {
              Alert.alert('Error', 'Could not delete screenshots.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}>
        <View style={styles.brandRow}>
          <View style={styles.headerAvatar}>
            <Image source={logoSource} style={styles.headerAvatarImage} />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + spacing.md }]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Image source={logoSource} style={styles.profileAvatarImage} />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>Memory</Text>
            <Text style={styles.profileEmail}>Your Library</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{screenshotCount}</Text>
            <Text style={styles.statLabel}>Screenshots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{categoryCount}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        <View style={styles.preferenceSection}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.preferenceCard}>
            {PREFERENCES.map(({ label, icon, type }, index, list) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.preferenceRow,
                  index !== list.length - 1 && styles.preferenceRowBorder,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSettingPress(label)}
              >
                <View style={styles.preferenceIcon}>
                  <PreferenceIcon type={type} icon={icon} />
                </View>
                <Text style={styles.preferenceText}>{label}</Text>
                <Text style={styles.preferenceChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.dangerButton} activeOpacity={0.9} onPress={handleClearAll}>
            <Feather name="trash-2" size={18} color={colors.danger} />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>APP VERSION 1.0.0 (2026)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMain,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    zIndex: 20,
    elevation: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  headerTitle: {
    ...typography.headline1,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 160,
    gap: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  profileMeta: {
    alignItems: 'center',
  },
  profileName: {
    ...typography.headline1,
    color: colors.text,
  },
  profileEmail: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.headline2,
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  preferenceSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.labelCaps,
    color: colors.textSecondary,
    marginLeft: spacing.unit * 2,
  },
  preferenceCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  preferenceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  preferenceIconText: {
    color: colors.text,
  },
  preferenceText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  preferenceChevron: {
    color: colors.textMuted,
    fontSize: 18,
  },
  dangerZone: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  dangerButton: {
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
    backgroundColor: 'rgba(147,0,10,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dangerButtonText: {
    ...typography.headline2,
    color: colors.danger,
  },
  versionText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default ProfileScreen;
