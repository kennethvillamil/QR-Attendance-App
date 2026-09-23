import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { DateTimeField } from '@/components/DateTimeField';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { createEvent } from '@/lib/events';
import { getProfile, type Role } from '@/lib/profiles';
import { buildQRPayload } from '@/lib/qr';
import { mergeDateAndTime } from '@/utils/date';

function initialEnd() {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return date;
}

export default function EventsScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(initialEnd);
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      getProfile(user.id).then((profile) => active && setRole(profile?.role ?? 'student'));
      return () => {
        active = false;
      };
    }, [user])
  );

  const normalizedCode = useMemo(() => code.trim().toUpperCase().replace(/\s+/g, '-'), [code]);

  const save = async () => {
    if (!user || !title.trim() || !normalizedCode) {
      setMessage({ text: 'Enter an event title and code.', success: false });
      return;
    }
    if (end <= start) {
      setMessage({ text: 'End time must be after start time.', success: false });
      return;
    }

    setSaving(true);
    setPayload(null);
    setMessage(null);
    const event = { eventId: normalizedCode, title: title.trim(), start: start.toISOString(), end: end.toISOString() };
    const { error } = await createEvent(event, user.id);
    setSaving(false);
    if (error) setMessage({ text: error, success: false });
    else {
      setPayload(buildQRPayload(event));
      setMessage({ text: 'Event saved.', success: true });
    }
  };

  if (role === null) {
    return <Screen title="Events" scroll={false}><View style={styles.center}><ActivityIndicator color={COLORS.ink} /></View></Screen>;
  }

  if (role !== 'teacher') {
    return <Screen title="Events"><StatusMessage text="Teacher accounts can create events." /></Screen>;
  }

  return (
    <Screen title="Events">
      <FormField label="Event title" value={title} onChangeText={setTitle} />
      <FormField label="Event code" value={code} onChangeText={setCode} autoCapitalize="characters" />
      <View style={styles.row}>
        <DateTimeField label="Start date" mode="date" value={start} onChange={(date) => setStart(mergeDateAndTime(date, start))} />
        <DateTimeField label="Start time" mode="time" value={start} onChange={(time) => setStart(mergeDateAndTime(start, time))} />
      </View>
      <View style={styles.row}>
        <DateTimeField label="End date" mode="date" value={end} minimumDate={start} onChange={(date) => setEnd(mergeDateAndTime(date, end))} />
        <DateTimeField label="End time" mode="time" value={end} onChange={(time) => setEnd(mergeDateAndTime(end, time))} />
      </View>
      {message ? <StatusMessage text={message.text} success={message.success} /> : null}
      <AppButton label="Save and generate QR" icon="qr-code-outline" loading={saving} onPress={save} />
      {payload ? (
        <View style={styles.qrCard}>
          <QRCode value={payload} size={220} backgroundColor={COLORS.card} color={COLORS.ink} />
          <Text selectable style={styles.code}>{normalizedCode}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  qrCard: { borderWidth: 1, borderColor: COLORS.borderStrong, borderRadius: 12, padding: 20, alignItems: 'center', gap: 14, backgroundColor: COLORS.card },
  code: { color: COLORS.ink, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});
