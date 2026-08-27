import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from './data';
import type { AppTab } from './types';
import { DesktopSidebar, MobileBottomNav, useResponsiveLayout } from './ui';

export default function AppShell({
  children,
  active,
  onChange,
  firstName = '',
}: PropsWithChildren<{ active: AppTab; onChange: (tab: AppTab) => void; firstName?: string }>) {
  const { desktop } = useResponsiveLayout();

  if (desktop) {
    return (
      <View style={styles.desktopRoot}>
        <DesktopSidebar active={active} onChange={onChange} firstName={firstName} />
        <View style={styles.desktopContent}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      <View style={styles.mobileContent}>{children}</View>
      <MobileBottomNav active={active} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopRoot: { flex: 1, minHeight: '100%', flexDirection: 'row', backgroundColor: colors.canvas },
  desktopContent: { flex: 1, minWidth: 0 },
  mobileRoot: { flex: 1, backgroundColor: colors.canvas },
  mobileContent: { flex: 1 },
});
