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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { getScreenshots, uploadScreenshot, deleteScreenshot } from '../services/api';
import useScreenshotStore from '../store/useScreenshotStore';
import ScreenshotCard from '../components/ScreenshotCard';
import CategoryPill from '../components/CategoryPill';
import SearchBar from '../components/SearchBar';
import FAB from '../components/FAB';
import { colors, spacing, CATEGORIES } from '../theme';
import { getLastChecked, setLastChecked } from '../utils/storage';

let isSyncing = false;

const HomeScreen = ({ navigation }) => {
  const { screenshots, loading, uploading, setScreenshots, addScreenshot, removeScreenshot, setLoading, setUploading } =
    useScreenshotStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
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
          first: 10,
        });

        // creationTime might be in seconds or milliseconds depending on OS/Expo version
        const newAssets = assets.filter((a) => {
          const assetTime = a.creationTime < 9999999999 ? a.creationTime * 1000 : a.creationTime;
          return assetTime > lastChecked;
        });

        if (newAssets.length === 0) return;

        // Update timestamp first to avoid double-uploads
        await setLastChecked(now);
        
        setUploading(true);

        for (let i = newAssets.length - 1; i >= 0; i--) {
          const asset = newAssets[i];
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset);
            const uri = info.localUri || info.uri;
            const result = await uploadScreenshot(uri);
            addScreenshot(result.data ?? result);
          } catch (e) {
            console.log('[AutoDetect] Upload failed:', e.message);
          }
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

  // Filter logic
  const filtered = screenshots.filter((s) => {
    const matchCategory = activeCategory === 'All' || s.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (s.summary && s.summary.toLowerCase().includes(q)) ||
      (s.extracted_text && s.extracted_text.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  const renderItem = ({ item }) => (
    <ScreenshotCard
      item={item}
      onPress={() => navigation.navigate('Detail', { screenshot: item })}
      onDelete={handleDelete}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Memory</Text>
        <TouchableOpacity
          style={styles.searchToggle}
          onPress={() => {
            setSearchVisible((v) => !v);
            if (searchVisible) setSearchQuery('');
          }}
        >
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
        </TouchableOpacity>
      </View>

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

      {/* Feed */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {loading ? '⏳' : '📭'}
            </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.textSecondary,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 6,
    height: 1.8,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
    position: 'absolute',
    bottom: 1,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  pillsScroll: {
    flexGrow: 0,
  },
  pillsContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultCount: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default HomeScreen;
