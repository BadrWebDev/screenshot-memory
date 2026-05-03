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
import { colors, getCategoryStyle, radius, spacing, typography } from '../theme';

const IMAGE_BASE = 'http://192.168.1.38:8000/storage/';

const ScreenshotCard = ({ item, onPress, onDelete }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const animateOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const handleLongPress = () => {
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
        onLongPress={handleLongPress}
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
          <View style={[styles.badge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.badgeText, { color: catStyle.text }]}>
              {item.category || 'Other'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.summary} numberOfLines={3}>
            {item.summary || 'Processing…'}
          </Text>

          {/* Tags row */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {(Array.isArray(item.tags)
                ? item.tags
                : item.tags.split(',')
              )
                .slice(0, 3)
                .map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {tag.trim().replace(/^#/, '')}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm + 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: 100,
    height: 110,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBg,
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.badge,
    fontSize: 9,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  summary: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});

export default ScreenshotCard;
