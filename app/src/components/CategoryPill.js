import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

const CategoryPill = ({ label, active, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () =>
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
  const animateOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        activeOpacity={1}
      >
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.unit * 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.unit * 2,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillInactive: {
    backgroundColor: colors.pillInactive,
    borderColor: colors.pillBorderInactive,
  },
  label: {
    fontSize: typography.labelCaps.fontSize,
    fontFamily: typography.labelCaps.fontFamily,
    letterSpacing: typography.labelCaps.letterSpacing,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.onAccent,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});

export default CategoryPill;
