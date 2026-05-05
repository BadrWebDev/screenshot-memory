import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useScreenshotStore from '../store/useScreenshotStore';
import { colors, spacing, typography, radius, CATEGORIES, getCategoryStyle } from '../theme';

const IMAGE_BASE = 'http://192.168.1.39:8000/storage/';

const SearchScreen = ({ navigation }) => {
  const { screenshots } = useScreenshotStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;

  const normalizeTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean);
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean);
        }
      } catch {}
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  };

  const filtered = useMemo(() => {
    return screenshots.filter((s) => {
      const matchCategory = activeCategory === 'All' || s.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const tagText = normalizeTags(s.tags).join(' ').toLowerCase();
      const matchSearch =
        !q ||
        (s.summary && s.summary.toLowerCase().includes(q)) ||
        (s.extracted_text && s.extracted_text.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        tagText.includes(q);
      return matchCategory && matchSearch;
    });
  }, [screenshots, activeCategory, searchQuery]);

  const resultLabel = searchQuery
    ? `${filtered.length} results for "${searchQuery}"`
    : `${filtered.length} results`;

  const renderItem = ({ item }) => {
    const imageUri = item.image_url?.startsWith('http')
      ? item.image_url
      : `${IMAGE_BASE}${item.image_url}`;
    const catStyle = getCategoryStyle(item.category);
    const dateLabel = item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '';

    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Detail', { screenshot: item })}
      >
        <View style={styles.resultThumb}>
          <Image source={{ uri: imageUri }} style={styles.resultImage} />
        </View>
        <View style={styles.resultBody}>
          <View style={styles.resultMeta}>
            <View style={[styles.resultBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.resultBadgeText, { color: catStyle.text }]}>
                {item.category || 'Other'}
              </Text>
            </View>
            <Text style={styles.resultDate}>{dateLabel}</Text>
          </View>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.summary || 'Untitled memory'}
          </Text>
          <Text style={styles.resultSummary} numberOfLines={1}>
            {item.extracted_text || 'Tap to view details'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <View style={styles.searchIcon}>
              <View style={styles.searchCircle} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search memories..."
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingTop: headerHeight + spacing.md }]}
        ListHeaderComponent={
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsScroll}
              contentContainerStyle={styles.pillsContent}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pill,
                    activeCategory === cat ? styles.pillActive : styles.pillInactive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.9}
                >
                  <Text style={activeCategory === cat ? styles.pillTextActive : styles.pillText}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.resultsLabel}>{resultLabel}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtitle}>Try a different keyword or category.</Text>
          </View>
        }
      />
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
    backgroundColor: colors.navBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    zIndex: 20,
    elevation: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  searchCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 6,
    height: 1.5,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
  },
  cancelButton: {
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    ...typography.headline2,
    fontSize: 14,
    color: colors.text,
  },
  pillsScroll: {
    marginHorizontal: -spacing.marginMain,
  },
  pillsContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: spacing.sm,
  },
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
  pillText: {
    fontSize: typography.labelCaps.fontSize,
    fontFamily: typography.labelCaps.fontFamily,
    letterSpacing: typography.labelCaps.letterSpacing,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  pillTextActive: {
    fontSize: typography.labelCaps.fontSize,
    fontFamily: typography.labelCaps.fontFamily,
    letterSpacing: typography.labelCaps.letterSpacing,
    textTransform: 'uppercase',
    color: colors.onAccent,
  },
  listContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 140,
    gap: spacing.sm,
  },
  resultsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultThumb: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultBody: {
    flex: 1,
    justifyContent: 'center',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.unit,
  },
  resultBadge: {
    paddingHorizontal: spacing.unit * 2,
    paddingVertical: spacing.unit,
    borderRadius: radius.sm,
  },
  resultBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  resultTitle: {
    ...typography.headline2,
    color: colors.text,
  },
  resultSummary: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.unit,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.headline2,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default SearchScreen;
