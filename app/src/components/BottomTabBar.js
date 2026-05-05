import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'grid' },
  { key: 'Search', label: 'Search', icon: 'search' },
  { key: 'Vault', label: 'Vault', icon: 'vault' },
  { key: 'Profile', label: 'Profile', icon: 'profile' },
];

const BottomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {TABS.map((tab, index) => {
        const route = state.routes[index];
        const focused = state.index === index;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.item, focused && styles.itemActive]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.9}
          >
            <TabIcon type={tab.icon} active={focused} />
            <Text style={focused ? styles.labelActive : styles.label}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabIcon = ({ type, active }) => {
  const tint = active ? colors.text : colors.textMuted;
  const borderTint = active ? colors.text : colors.textMuted;

  if (type === 'grid') {
    return (
      <View style={styles.gridIcon}>
        <View style={[styles.gridCell, { backgroundColor: tint }]} />
        <View style={[styles.gridCell, { backgroundColor: tint }]} />
        <View style={[styles.gridCell, { backgroundColor: tint }]} />
        <View style={[styles.gridCell, { backgroundColor: tint }]} />
      </View>
    );
  }

  if (type === 'search') {
    return (
      <View style={styles.searchIcon}>
        <View style={[styles.searchCircle, { borderColor: borderTint }]} />
        <View style={[styles.searchHandle, { backgroundColor: tint }]} />
      </View>
    );
  }

  if (type === 'vault') {
    return (
      <Feather name="copy" size={18} color={active ? colors.text : colors.textMuted} />
    );
  }

  return (
    <View style={styles.profileIcon}>
      <View style={[styles.profileHead, { borderColor: borderTint }]} />
      <View style={[styles.profileBody, { borderColor: borderTint }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    zIndex: 20,
    elevation: 20,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  itemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  labelActive: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
    letterSpacing: 1.4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  gridIcon: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  gridCell: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  searchIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 6,
    height: 1.5,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  profileIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
  },
  profileBody: {
    width: 12,
    height: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    marginTop: 2,
  },
});

export default BottomTabBar;
