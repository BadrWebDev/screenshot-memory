import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { getScreenshots, uploadScreenshot, deleteScreenshot } from '../services/api';
import useScreenshotStore from '../store/useScreenshotStore';
import ScreenshotCard from '../components/ScreenshotCard';
import CategoryPill from '../components/CategoryPill';
import SearchBar from '../components/SearchBar';
import FAB from '../components/FAB';
import { colors, spacing, typography, radius, CATEGORIES } from '../theme';

const logoSource = require('../../assets/icon.png');
import { getLastChecked, setLastChecked } from '../utils/storage';

let isSyncing = false;

const HomeScreen = ({ navigation }) => {
  const {
    screenshots,
    favorites,
    loading,
    uploading,
    setScreenshots,
    addScreenshot,
    removeScreenshot,
    setLoading,
    setUploading,
    toggleFavorite,
  } = useScreenshotStore();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  // Real-time screenshot detection — fires on mount and when new photos are added
  useEffect(() => {
    let subscription;

    const syncScreenshots = async () => {
      if (isSyncing) return;
      isSyncing = true;

      try {
        // Find the Screenshots album
        const album = await MediaLibrary.getAlbumAsync('Screenshots');
        if (!album) return;

        const lastChecked = await getLastChecked();
        const now = Date.now();

        const { assets } = await MediaLibrary.getAssetsAsync({
          album,
          mediaType: MediaLibrary.MediaType.photo,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
          first: 15,
        });
        // creationTime might be in seconds or milliseconds depending on OS/Expo version
        const newAssets = assets.filter((a) => {
          const assetTime = a.creationTime < 9999999999 ? a.creationTime * 1000 : a.creationTime;
          return assetTime > lastChecked;
        });

        if (newAssets.length === 0) return;

        // Find the maximum creation time among newAssets
        let maxTime = lastChecked;
        newAssets.forEach(a => {
            const assetTime = a.creationTime < 9999999999 ? a.creationTime * 1000 : a.creationTime;
            if (assetTime > maxTime) maxTime = assetTime;
        });

        setUploading(true);
        let successCount = 0;

        for (let i = newAssets.length - 1; i >= 0; i--) {
          const asset = newAssets[i];
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset);
            const uri = info.localUri || info.uri;
            const result = await uploadScreenshot(uri);
            addScreenshot(result.data ?? result);
            successCount++;
          } catch (e) {
            console.log('[AutoDetect] Upload failed:', e.message);
          }
        }

        // Only update lastChecked if we successfully processed at least one
        if (successCount > 0) {
            await setLastChecked(maxTime);
        }
      } catch (e) {
        console.log('[AutoDetect] Sync error:', e.message);
      } finally {
        setUploading(false);
        isSyncing = false;
      }
    };

    const startWatching = async () => {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== 'granted') return;

      // Sync existing screenshots right away on launch
      await syncScreenshots();

      // Listen for any new screenshots taken while app is open
      subscription = MediaLibrary.addListener(syncScreenshots);
    };

    startWatching();
    return () => subscription?.remove();
  }, [addScreenshot, setUploading]);

  const fetchScreenshots = async () => {
    setLoading(true);
    try {
      const data = await getScreenshots();
      setScreenshots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getScreenshots();
      setScreenshots(Array.isArray(data) ? data : []);
    } catch {}
    setRefreshing(false);
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const newScreenshot = await uploadScreenshot(uri);
      addScreenshot(newScreenshot.data ?? newScreenshot);
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload screenshot.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteScreenshot(id);
      removeScreenshot(id);
    } catch (err) {
      Alert.alert('Error', 'Could not delete screenshot.');
    }
  }, [removeScreenshot]);

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

  // Filter logic
  const filtered = screenshots.filter((s) => {
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

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.gridItem,
        index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
      ]}
    >
      <ScreenshotCard
        item={item}
        onPress={() => navigation.navigate('Detail', { screenshot: item })}
        onDelete={handleDelete}
        isStarred={favorites.includes(item.id)}
        onToggleStar={toggleFavorite}
      />
    </View>
  );

  const headerHeight = 56 + insets.top;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}>
        <View style={styles.brandRow}>
          <View style={styles.avatar}>
            <Image source={logoSource} style={styles.avatarImage} />
          </View>
          <Text style={styles.title}>Memory</Text>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: Math.max(0, headerHeight - spacing.sm) },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Search bar */}
            <SearchBar
              visible={searchVisible}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            {/* Category pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsScroll}
              contentContainerStyle={styles.pillsContent}
            >
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onPress={() => setActiveCategory(cat)}
                />
              ))}
            </ScrollView>
            {/* Results count */}
            {(searchQuery || activeCategory !== 'All') && (
              <Text style={styles.resultCount}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            colors={[colors.text]}
            progressBackgroundColor={colors.bg}
            progressViewOffset={headerHeight}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBase}>
              {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : searchQuery ? (
                <View style={styles.emptySearchIcon}>
                  <View style={styles.emptySearchCircle} />
                  <View style={styles.emptySearchHandle} />
                </View>
              ) : (
                <View style={styles.emptyStackIcon}>
                  <View style={styles.emptyStackBack} />
                  <View style={styles.emptyStackFront} />
                  <View style={styles.emptyStackPlusV} />
                  <View style={styles.emptyStackPlusH} />
                </View>
              )}
            </View>
            <Text style={styles.emptyTitle}>
              {loading ? 'Loading…' : searchQuery ? 'No results found' : 'No screenshots yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {!loading && !searchQuery && 'Tap + to add your first screenshot'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <FAB onPress={handleUpload} loading={uploading} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMain,
    paddingBottom: spacing.sm,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  title: {
    fontSize: typography.headline1.fontSize,
    fontFamily: typography.headline1.fontFamily,
    color: colors.text,
    letterSpacing: typography.headline1.letterSpacing,
  },
  pillsScroll: {
    flexGrow: 0,
    marginHorizontal: -spacing.marginMain,
  },
  pillsContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: spacing.sm,
  },
  resultCount: {
    fontSize: typography.labelCaps.fontSize,
    fontFamily: typography.labelCaps.fontFamily,
    color: colors.textMuted,
    paddingHorizontal: spacing.marginMain,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 160,
  },
  listHeader: {
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  gridItemLeft: {
    marginRight: spacing.gutter / 2,
  },
  gridItemRight: {
    marginLeft: spacing.gutter / 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconBase: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptySearchIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textMuted,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  emptySearchHandle: {
    width: 8,
    height: 2,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  emptyStackIcon: {
    width: 32,
    height: 28,
  },
  emptyStackBack: {
    position: 'absolute',
    width: 24,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  emptyStackFront: {
    position: 'absolute',
    width: 24,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    bottom: 0,
    right: 0,
  },
  emptyStackPlusV: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: colors.textMuted,
    right: 2,
    top: 2,
    borderRadius: 2,
  },
  emptyStackPlusH: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: colors.textMuted,
    right: -2,
    top: 6,
    borderRadius: 2,
  },
  emptyTitle: {
    fontSize: typography.headline2.fontSize,
    fontFamily: typography.headline2.fontFamily,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.textMuted,
  },
});

export default HomeScreen;
