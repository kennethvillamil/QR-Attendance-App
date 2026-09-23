import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { COLORS } from '@/constants/theme';
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from '@/lib/attendance';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import { formatDateTime } from '@/utils/date';

function Empty({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="file-tray-outline" size={28} color={COLORS.ink} />
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

function StudentHistory({ records }: { records: AttendanceRecord[] }) {
  if (!records.length) return <Empty label="No attendance records." />;
  return (
    <View style={styles.list}>
      {records.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.cardTitle}>{record.eventTitle || record.eventId}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{record.eventId}</Text>
            <Text style={styles.meta}>{formatDateTime(record.scannedAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TeacherHistory({ events }: { events: TeacherEventAttendance[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!events.length) return <Empty label="No events." />;
  return (
    <View style={styles.list}>
      {events.map((event) => {
        const open = expanded === event.eventId;
        return (
          <View key={event.eventId} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setExpanded(open ? null : event.eventId)}
              style={({ pressed }) => [styles.eventHeader, pressed && styles.pressed]}
            >
              <View style={styles.eventHeading}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.meta}>{event.eventCode}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countText}>{event.attendeeCount}</Text>
              </View>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.ink} />
            </Pressable>
            {open ? (
              <View style={styles.attendees}>
                {event.attendees.length ? event.attendees.map((attendee) => (
                  <View key={`${attendee.studentId}-${attendee.scannedAt}`} style={styles.attendee}>
                    <View style={styles.attendeeText}>
                      <Text style={styles.attendeeName}>{attendee.studentName || `...${attendee.studentId.slice(-8)}`}</Text>
                      {attendee.email ? <Text style={styles.meta}>{attendee.email}</Text> : null}
                    </View>
                    <Text style={styles.meta}>{formatDateTime(attendee.scannedAt)}</Text>
                  </View>
                )) : <Text style={styles.meta}>No attendees.</Text>}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const currentRole = (await getProfile(user.id))?.role ?? 'student';
    setRole(currentRole);
    if (currentRole === 'teacher') {
      setTeacherEvents(await getTeacherEventAttendance(user.id));
      setStudentRecords([]);
    } else {
      setStudentRecords(await getAttendanceHistory(user.id));
      setTeacherEvents([]);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => void load(), [load]));

  return (
    <Screen title="Attendance">
      {loading ? <ActivityIndicator color={COLORS.ink} /> : role === 'teacher' ? <TeacherHistory events={teacherEvents} /> : <StudentHistory records={studentRecords} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.card, overflow: 'hidden' },
  cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  metaRow: { padding: 16, paddingTop: 8, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  meta: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  eventHeader: { minHeight: 68, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventHeading: { flex: 1, gap: 4 },
  count: { minWidth: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  countText: { color: COLORS.inverted, fontSize: 14, fontWeight: '800' },
  attendees: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 14, gap: 12, backgroundColor: COLORS.surface },
  attendee: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  attendeeText: { flex: 1, gap: 2 },
  attendeeName: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  empty: { minHeight: 180, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: COLORS.ink, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.65 },
});
