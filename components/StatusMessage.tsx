import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

export function StatusMessage({ text, success = false }: { text: string; success?: boolean }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.box}>
      <Ionicons name={success ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={21} color={COLORS.ink} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: { flex: 1, color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
