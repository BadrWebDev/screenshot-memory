import React, { useMemo, useRef, useState } from 'react';
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
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteScreenshot, updateScreenshot, reanalyzeScreenshot } from '../services/api';
import useScreenshotStore from '../store/useScreenshotStore';
import { colors, getCategoryStyle, radius, spacing, typography } from '../theme';

const IMAGE_BASE = 'http://192.168.1.39:8000/storage/';
const { height } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = Math.round(height * 0.78);

const DetailScreen = ({ route, navigation }) => {
  const { screenshot } = route.params;
  const { removeScreenshot, screenshots, updateScreenshot: updateScreenshotInStore } = useScreenshotStore();
  const insets = useSafeAreaInsets();

  const currentScreenshot = screenshots.find((item) => item.id === screenshot.id) || screenshot;

  const imageUri = screenshot.image_url?.startsWith('http')
    ? screenshot.image_url
    : `${IMAGE_BASE}${screenshot.image_url}`;

  const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try { return JSON.parse(tags); } catch { return tags.split(','); }
  };

  const [summary, setSummary] = useState(currentScreenshot.summary || '');
  const [category, setCategory] = useState(currentScreenshot.category || 'Other');
  const [extractedText, setExtractedText] = useState(currentScreenshot.extracted_text || '');
  const [tags, setTags] = useState(() => parseTags(currentScreenshot.tags));
  const [copyLabel, setCopyLabel] = useState('Copy Text');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const copyTimer = useRef(null);

  const catStyle = useMemo(() => getCategoryStyle(category), [category]);

  React.useEffect(() => {
    setSummary(currentScreenshot.summary || '');
    setCategory(currentScreenshot.category || 'Other');
    setExtractedText(currentScreenshot.extracted_text || '');
    setTags(parseTags(currentScreenshot.tags));
  }, [currentScreenshot]);


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

  const handleCopy = async () => {
    if (!extractedText) return;
    await Clipboard.setStringAsync(extractedText);
    setCopyLabel('Copied!');
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyLabel('Copy Text'), 2000);
  };

  const updateTagsRemote = async (nextTags) => {
    const updated = await updateScreenshot(screenshot.id, { tags: nextTags });
    if (updated?.tags) {
      const normalizedTags = parseTags(updated.tags);
      setTags(normalizedTags);
      updateScreenshotInStore(screenshot.id, { tags: normalizedTags });
      return normalizedTags;
    }
    updateScreenshotInStore(screenshot.id, { tags: nextTags });
    return nextTags;
  };

  const handleAddTag = () => {
    setTagDraft('');
    setTagModalVisible(true);
  };

  const handleConfirmAddTag = async () => {
    const next = String(tagDraft || '').trim();
    if (!next) {
      setTagModalVisible(false);
      return;
    }
    const normalized = next.replace(/^#/, '');
    const nextTags = Array.from(new Set([...tags, normalized]));
    setTags(nextTags);
    setTagModalVisible(false);
    try {
      const persistedTags = await updateTagsRemote(nextTags);
      updateScreenshotInStore(screenshot.id, { tags: persistedTags });
    } catch {
      Alert.alert('Error', 'Could not update tags.');
    }
  };

  const handleRemoveTag = (tag) => {
    Alert.alert(`Remove tag #${tag}?`, '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const nextTags = tags.filter((t) => t !== tag);
          setTags(nextTags);
          try {
            const persistedTags = await updateTagsRemote(nextTags);
            updateScreenshotInStore(screenshot.id, { tags: persistedTags });
          } catch {
            Alert.alert('Error', 'Could not update tags.');
          }
        },
      },
    ]);
  };

  const handleReanalyze = async () => {
    if (reanalyzing) return;
    setReanalyzing(true);
    try {
      const data = await reanalyzeScreenshot(screenshot.id);
      const nextSummary = data.summary || '';
      const nextCategory = data.category || 'Other';
      const nextExtractedText = data.extracted_text || '';
      const nextTags = parseTags(data.tags);

      setSummary(nextSummary);
      setCategory(nextCategory);
      setExtractedText(nextExtractedText);
      setTags(nextTags);

      updateScreenshotInStore(screenshot.id, {
        summary: nextSummary,
        category: nextCategory,
        extracted_text: nextExtractedText,
        tags: nextTags,
      });
    } catch {
      Alert.alert('Error', 'Could not re-analyze screenshot.');
    } finally {
      setReanalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.imageBackdrop}>
        <View style={[styles.imageWrap, { paddingTop: insets.top + spacing.lg }]}
        >
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>
      </View>

      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <View style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Memory</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: catStyle.bg, borderColor: catStyle.text + '33' }]}
            >
              <Text style={[styles.badgeText, { color: catStyle.text }]}>
                {screenshot.category || 'Other'}
              </Text>
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          {summary ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.sparkleDot} />
                <Text style={styles.summaryLabel}>AI Insight</Text>
              </View>
              <Text style={styles.summaryText}>{summary}</Text>
              <TouchableOpacity
                style={styles.reanalyzeButton}
                onPress={handleReanalyze}
                activeOpacity={0.8}
              >
                {reanalyzing ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.reanalyzeText}>Re-analyze</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {extractedText ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Extracted Text</Text>
                <TouchableOpacity style={styles.copyButton} activeOpacity={0.8} onPress={handleCopy}>
                  <Text style={styles.copyText}>{copyLabel}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.extractedBox}>
                <Text style={styles.extractedText}>{extractedText}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsWrap}>
              {tags.map((tag, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.tag}
                  onLongPress={() => handleRemoveTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tagText}>#{typeof tag === 'string' ? tag.trim().replace(/^#/, '') : tag}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addTag} activeOpacity={0.8} onPress={handleAddTag}>
                <Text style={styles.addTagText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      <Modal
        visible={tagModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add a tag</Text>
              <TextInput
                style={styles.modalInput}
                value={tagDraft}
                onChangeText={setTagDraft}
                placeholder="Tag"
                placeholderTextColor={colors.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleConfirmAddTag}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setTagModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleConfirmAddTag}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonTextPrimary}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  imageBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0f0f',
  },
  imageWrap: {
    flex: 1,
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: spacing.marginMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    zIndex: 20,
    elevation: 12,
  },
  headerSide: {
    width: 64,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.text,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  headerTitle: {
    ...typography.headline2,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    minWidth: 64,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    ...typography.caption,
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SHEET_MAX_HEIGHT,
    backgroundColor: colors.sheetBg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderTopColor: colors.sheetBorder,
    overflow: 'hidden',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: spacing.sm,
  },
  sheetContent: {
    paddingHorizontal: spacing.marginMain,
    paddingBottom: 32,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.unit * 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.labelCaps,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reanalyzeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.unit * 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  reanalyzeText: {
    ...typography.caption,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.headline2,
    color: colors.text,
  },
  modalInput: {
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: typography.bodySm.fontFamily,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.unit * 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modalButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modalButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  modalButtonTextPrimary: {
    ...typography.caption,
    color: colors.onAccent,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.unit * 2,
  },
  sparkleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  summaryLabel: {
    ...typography.labelCaps,
    color: colors.textMuted,
  },
  summaryText: {
    ...typography.headline1,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.headline2,
    color: colors.text,
  },
  copyButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.unit * 2,
  },
  copyText: {
    ...typography.caption,
    color: '#60A5FA',
  },
  extractedBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  extractedText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.unit * 2,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: colors.glass,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.unit * 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addTag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagText: {
    color: colors.textMuted,
    fontSize: 18,
  },
});

export default DetailScreen;
