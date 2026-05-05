import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useScreenshotStore from '../store/useScreenshotStore';
import ScreenshotCard from '../components/ScreenshotCard';
import { colors, spacing, typography, radius } from '../theme';

const logoSource = require('../../assets/icon.png');

const VaultScreen = ({ navigation }) => {
  const { screenshots, favorites, toggleFavorite } = useScreenshotStore();
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;

  const starredScreenshots = screenshots.filter((s) => favorites.includes(s.id));

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
        isStarred
          onToggleStar={toggleFavorite}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}>
        <View style={styles.brandRow}>
          <View style={styles.avatar}>
            <Image source={logoSource} style={styles.avatarImage} />
          </View>
          <Text style={styles.title}>Vault</Text>
        </View>
      </View>

      <FlatList
        data={starredScreenshots}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingTop: headerHeight + spacing.sm }]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerCopy}>
            <Text style={styles.sectionTitle}>Vault</Text>
            <Text style={styles.sectionSubtitle}>Your saved screenshots</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Feather name="copy" size={24} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>Tap the star on a screenshot to save it here.</Text>
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
    ...typography.headline1,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 160,
  },
  headerCopy: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline1,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
    textAlign: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});

export default VaultScreen;
