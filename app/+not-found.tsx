import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { COLORS } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Page not found</Text>
        <AppButton label="Go home" icon="home-outline" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 24 },
  title: { color: COLORS.ink, fontSize: 28, fontWeight: '800', textAlign: 'center' },
});
