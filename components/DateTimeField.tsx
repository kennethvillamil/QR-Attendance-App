import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { COLORS } from '@/constants/theme';
import { formatDate, formatTime } from '@/utils/date';

type Props = {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (value: Date) => void;
  minimumDate?: Date;
};

export function DateTimeField({ label, mode, value, onChange, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const close = () => {
    setDraft(value);
    setOpen(false);
  };

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${mode === 'date' ? formatDate(value) : formatTime(value)}`}
        accessibilityHint={`Opens ${mode} picker`}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Text style={styles.value}>{mode === 'date' ? formatDate(value) : formatTime(value)}</Text>
        <Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={21} color={COLORS.ink} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.scrim}>
          <View accessibilityViewIsModal style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.modalTitle}>
                {label}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close picker" hitSlop={12} onPress={close} style={styles.close}>
                <Ionicons name="close" size={24} color={COLORS.ink} />
              </Pressable>
            </View>
            <DateTimePicker
              display={Platform.OS === 'ios' ? (mode === 'date' ? 'inline' : 'spinner') : 'default'}
              minimumDate={minimumDate}
              mode={mode}
              onChange={(event, next) => {
                if (Platform.OS === 'android') {
                  if (event.type === 'set' && next) onChange(next);
                  setOpen(false);
                  return;
                }
                if (next) setDraft(next);
              }}
              themeVariant="light"
              value={draft}
            />
            {Platform.OS === 'ios' ? (
              <View style={styles.actions}>
                <AppButton label="Cancel" variant="secondary" onPress={close} style={styles.action} />
                <AppButton
                  label="Done"
                  onPress={() => {
                    onChange(draft);
                    setOpen(false);
                  }}
                  style={styles.action}
                />
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flex: 1, minWidth: 140, gap: 8 },
  label: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  field: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pressed: { backgroundColor: COLORS.surface },
  value: { flex: 1, color: COLORS.ink, fontSize: 16, fontWeight: '600' },
  scrim: { flex: 1, backgroundColor: COLORS.scrim, justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.borderStrong, gap: 12 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '800' },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
});
