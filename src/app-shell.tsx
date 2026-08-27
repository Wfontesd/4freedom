import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from './data';
import type { AppTab } from './types';
import { MobileBottomNav } from './ui';

export default function AppShell({
  children,
  active,
  onChange,
  firstName: _firstName = '',
}: PropsWithChildren<{ active: AppTab; onChange: (tab: AppTab) => void; firstName?: string }>) {
  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>
      <MobileBottomNav active={active} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1 },
});
