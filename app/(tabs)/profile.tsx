import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { COLORS } from '@/constants/theme';
import { signOut, useAuth } from '@/lib/auth';
import { getProfile, type Profile, updateProfile } from '@/lib/profiles';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const next = await getProfile(user.id);
    setProfile(next);
    setDraftName(next?.full_name ?? '');
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => void load(), [load]));

  const saveName = async () => {
    if (!user || !draftName.trim()) {
      setMessage('Enter a name.');
      return;
    }
    setSaving(true);
    const { error } = await updateProfile(user.id, { full_name: draftName.trim() });
    setSaving(false);
    if (error) setMessage(error);
    else {
      setProfile((current) => current ? { ...current, full_name: draftName.trim() } : current);
      setEditing(false);
      setMessage(null);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Sign out of this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <Screen title="Profile">
      {loading ? <ActivityIndicator color={COLORS.ink} /> : (
        <>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profile?.role === 'teacher' ? 'TEACHER' : 'STUDENT'}</Text>
          </View>
          <View style={styles.details}>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              {editing ? (
                <View style={styles.editBlock}>
                  <FormField label="Full name" value={draftName} onChangeText={setDraftName} />
                  <View style={styles.editActions}>
                    <AppButton label="Cancel" variant="secondary" onPress={() => { setEditing(false); setDraftName(profile?.full_name ?? ''); }} style={styles.editButton} />
                    <AppButton label="Save" loading={saving} onPress={saveName} style={styles.editButton} />
                  </View>
                </View>
              ) : (
                <Pressable accessibilityRole="button" onPress={() => setEditing(true)} style={styles.editName}>
                  <Text style={styles.value}>{profile?.full_name || 'Add name'}</Text>
                  <Text style={styles.editLabel}>Edit</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text selectable style={styles.value}>{profile?.email || user?.email || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>User ID</Text>
              <Text selectable style={styles.id}>{user?.id || '-'}</Text>
            </View>
          </View>
          {message ? <StatusMessage text={message} /> : null}
          <AppButton label="Sign out" icon="log-out-outline" variant="danger" onPress={handleSignOut} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.borderStrong, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { color: COLORS.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  details: { borderTopWidth: 1, borderTopColor: COLORS.border },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  label: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  value: { color: COLORS.ink, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  id: { color: COLORS.ink, fontSize: 13, lineHeight: 19 },
  editName: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  editLabel: { color: COLORS.ink, fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
  editBlock: { gap: 12 },
  editActions: { flexDirection: 'row', gap: 10 },
  editButton: { flex: 1 },
});
