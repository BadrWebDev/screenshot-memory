import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, getCategoryStyle, radius, spacing, typography } from '../theme';

const IMAGE_BASE = 'http://192.168.1.39:8000/storage/';

const ScreenshotCard = ({ item, onPress, onDelete, isStarred, onToggleStar }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const animateOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Screenshot',
      'Are you sure you want to delete this screenshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const catStyle = getCategoryStyle(item.category);

  // Build image URI — handle both full URLs and filename-only values
  const imageUri =
    item.image_url?.startsWith('http')
      ? item.image_url
      : `${IMAGE_BASE}${item.image_url}`;

  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={onPress}
        onLongPress={onDelete ? handleLongPress : undefined}
        onPressIn={animateIn}
        onPressOut={animateOut}
        delayLongPress={500}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {/* Category badge overlaid on thumbnail */}
          <View style={styles.badgeWrap}>
            <View style={[styles.badge, { backgroundColor: catStyle.bg, borderColor: catStyle.text + '66' }]}>
              <Text style={[styles.badgeText, { color: catStyle.text }]}>
                {item.category || 'Other'}
              </Text>
            </View>
          </View>
          {onToggleStar && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => onToggleStar(item.id)}
              activeOpacity={0.65}
            >
              <MaterialIcons
                name={isStarred ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color="white"
                style={isStarred ? styles.bookmarkActive : styles.bookmarkInactive}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.summary} numberOfLines={1}>
            {item.summary || 'Processing...'}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: spacing.gutter,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceElevated,
  },
  badge: {
    paddingHorizontal: spacing.unit * 2,
    paddingVertical: spacing.unit,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeWrap: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    padding: 2,
    borderRadius: radius.sm + 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: {
    ...typography.badge,
    fontSize: 10,
  },
  bookmarkButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkInactive: {
    opacity: 0.4,
  },
  bookmarkActive: {
    opacity: 1,
  },
  content: {
    paddingHorizontal: spacing.unit * 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  summary: {
    ...typography.headline2,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.unit,
  },
});

export default ScreenshotCard;
