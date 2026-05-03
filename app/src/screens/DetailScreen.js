import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { deleteScreenshot } from '../services/api';
import useScreenshotStore from '../store/useScreenshotStore';
import { colors, getCategoryStyle, radius, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');
const IMAGE_BASE = 'http://192.168.1.38:8000/storage/';

const DetailScreen = ({ route, navigation }) => {
  const { screenshot } = route.params;
  const { removeScreenshot } = useScreenshotStore();

  const imageUri = screenshot.image_url?.startsWith('http')
    ? screenshot.image_url
    : `${IMAGE_BASE}${screenshot.image_url}`;

  const catStyle = getCategoryStyle(screenshot.category);

  const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try { return JSON.parse(tags); } catch { return tags.split(','); }
  };
  const tags = parseTags(screenshot.tags);

  const formattedDate = screenshot.created_at
    ? new Date(screenshot.created_at).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const handleDelete = () => {
    Alert.alert('Delete Screenshot', 'This will permanently delete this screenshot.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteScreenshot(screenshot.id);
            removeScreenshot(screenshot.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Could not delete screenshot.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{screenshot.category || 'Detail'}</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.badgeText, { color: catStyle.text }]}>{screenshot.category || 'Other'}</Text>
          </View>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {screenshot.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AI Summary</Text>
            <Text style={styles.summaryText}>{screenshot.summary}</Text>
          </View>
        ) : null}

        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsWrap}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{typeof tag === 'string' ? tag.trim().replace(/^#/, '') : tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {screenshot.extracted_text ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Extracted Text</Text>
            <View style={styles.extractedBox}>
              <Text style={styles.extractedText}>{screenshot.extracted_text}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.xl + spacing.md, paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md, justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {
    width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2,
    borderColor: colors.text, transform: [{ rotate: '45deg' }], marginLeft: 4,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: '#2a1010', borderWidth: 1, borderColor: '#3a1515' },
  deleteBtnText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingBottom: 40 },
  imageContainer: { width: '100%', backgroundColor: colors.card, marginBottom: spacing.md },
  image: { width: '100%', aspectRatio: 9 / 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  date: { fontSize: 12, color: colors.textSecondary },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: spacing.sm },
  summaryText: { ...typography.body, lineHeight: 26, color: colors.text },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: colors.accentSoft, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.accent + '33' },
  tagText: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  extractedBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  extractedText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});

export default DetailScreen;
