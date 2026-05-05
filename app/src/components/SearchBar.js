import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

// Simple inline SVG-free icon using text characters
const SearchIcon = () => (
  <View style={styles.iconBox}>
    <View style={styles.iconCircle} />
    <View style={styles.iconHandle} />
  </View>
);

const ClearIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.clearBtn}>
    <View style={styles.clearBox}>
      <View style={[styles.clearLine, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.clearLine, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  </TouchableOpacity>
);

const SearchBar = ({ value, onChangeText, onClear, visible }) => {
  const height = useRef(new Animated.Value(visible ? 58 : 0)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(height, {
        toValue: visible ? 58 : 0,
        useNativeDriver: false,
        damping: 20,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { height, opacity }]}>
      <View style={styles.inputWrapper}>
        <SearchIcon />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search your memories..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value.length > 0 && <ClearIcon onPress={onClear} />}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingHorizontal: spacing.marginMain,
    paddingBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  clearBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  // Search icon made from primitives
  iconBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  iconHandle: {
    width: 6,
    height: 1.5,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    position: 'absolute',
    bottom: 1,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
});

export default SearchBar;
