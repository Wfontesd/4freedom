import type { PropsWithChildren, ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './data';
import type { AppTab } from './types';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 980;
  const wide = width >= 700;
  return { width, height, desktop, wide };
}

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, compact && styles.brandIconCompact, inverse && styles.brandIconInverse]}>
        <Text style={[styles.brandIconText, compact && styles.brandIconTextCompact, inverse && styles.brandIconTextInverse]}>T</Text>
      </View>
      <Text style={[styles.brandText, compact && styles.brandTextCompact, inverse && styles.brandTextInverse]}>TutoVie</Text>
      {!compact ? <View style={styles.betaPill}><Text style={styles.betaText}>MAQUETTE</Text></View> : null}
    </View>
  );
}

export function ScreenShell({
  children,
  scroll = true,
  contentStyle,
  maxWidth = 1180,
}: PropsWithChildren<{ scroll?: boolean; contentStyle?: StyleProp<ViewStyle>; maxWidth?: number }>) {
  const { desktop } = useResponsiveLayout();
  const content = [styles.screenContent, desktop && styles.screenContentDesktop, { maxWidth }, contentStyle];
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[...content, styles.flex]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, compact && styles.buttonTextCompact]}>{label}</Text>
      {icon ? <Text style={styles.primaryButtonIcon}>{icon}</Text> : null}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, compact && styles.buttonCompact, pressed && styles.buttonPressed]}
    >
      {icon ? <Text style={styles.secondaryButtonIcon}>{icon}</Text> : null}
      <Text style={[styles.secondaryButtonText, compact && styles.buttonTextCompact]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed]}>
      <Text style={[styles.ghostButtonText, danger && styles.ghostDanger]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string; helper?: string; suffix?: string }) {
  const { label, helper, suffix, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput
          placeholderTextColor="#A29AAA"
          {...inputProps}
          style={[styles.field, inputProps.multiline && styles.fieldMultiline, suffix && styles.fieldWithSuffix, inputProps.style]}
        />
        {suffix ? <Text style={styles.fieldSuffix}>{suffix}</Text> : null}
      </View>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
    </View>
  );
}

export function ChoiceCard({
  selected,
  onPress,
  icon,
  title,
  caption,
  compact = false,
}: {
  selected: boolean;
  onPress: () => void;
  icon?: string;
  title: string;
  caption?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        compact && styles.choiceCardCompact,
        selected && styles.choiceCardSelected,
        pressed && styles.buttonPressed,
      ]}
    >
      {icon ? <View style={styles.choiceIcon}><Text style={styles.choiceIconText}>{icon}</Text></View> : null}
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {caption ? <Text style={styles.choiceCaption}>{caption}</Text> : null}
      </View>
      <View style={[styles.choiceDot, selected && styles.choiceDotSelected]}>{selected ? <Text style={styles.choiceCheck}>✓</Text> : null}</View>
    </Pressable>
  );
}

export function SelectChip({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.buttonPressed]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{selected ? '✓  ' : ''}{label}</Text>
    </Pressable>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: 'neutral' | 'purple' | 'good' | 'warning' | 'danger' | 'lime' }>) {
  return (
    <View style={[
      styles.pill,
      tone === 'purple' && styles.pillPurple,
      tone === 'good' && styles.pillGood,
      tone === 'warning' && styles.pillWarning,
      tone === 'danger' && styles.pillDanger,
      tone === 'lime' && styles.pillLime,
    ]}>
      <Text style={[
        styles.pillText,
        tone === 'purple' && styles.pillTextPurple,
        tone === 'good' && styles.pillTextGood,
        tone === 'warning' && styles.pillTextWarning,
        tone === 'danger' && styles.pillTextDanger,
        tone === 'lime' && styles.pillTextLime,
      ]}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ value, animatedValue }: { value: number; animatedValue?: Animated.Value }) {
  const animatedWidth = animatedValue?.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const staticWidth = `${Math.max(0, Math.min(1, value)) * 100}%` as `${number}%`;
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, animatedValue ? { width: animatedWidth } : { width: staticWidth }]} />
    </View>
  );
}

const navItems: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '⌂' },
  { id: 'roadmap', label: 'Démarches', icon: '→' },
  { id: 'vault', label: 'Documents', icon: '▤' },
  { id: 'assistant', label: 'Assistant', icon: '?' },
  { id: 'profile', label: 'Profil', icon: '○' },
];

export function MobileBottomNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.navSafe}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const selected = item.id === active;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(item.id)}
              style={({ pressed }) => [styles.navItem, selected && styles.navItemActive, pressed && styles.buttonPressed]}
            >
              <Text style={[styles.navIcon, selected && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function DesktopSidebar({
  active,
  onChange,
  firstName,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  firstName: string;
}) {
  return (
    <View style={styles.sidebar}>
      <BrandMark inverse />
      <View style={styles.sidebarNav}>
        {navItems.map((item) => {
          const selected = item.id === active;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={({ pressed }) => [styles.sidebarItem, selected && styles.sidebarItemActive, pressed && styles.sidebarItemPressed]}
            >
              <Text style={[styles.sidebarIcon, selected && styles.sidebarTextActive]}>{item.icon}</Text>
              <Text style={[styles.sidebarLabel, selected && styles.sidebarTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sidebarBottom}>
        <View style={styles.sidebarAvatar}><Text style={styles.sidebarAvatarText}>{(firstName || 'T').slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.sidebarUserCopy}>
          <Text style={styles.sidebarUserName}>{firstName || 'Profil démo'}</Text>
          <Text style={styles.sidebarUserHint}>Parcours local</Text>
        </View>
      </View>
    </View>
  );
}

export function SectionTitle({ title, action, subtitle }: { title: string; action?: ReactNode; subtitle?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function InfoCard({ title, children, tone = 'purple' }: PropsWithChildren<{ title: string; tone?: 'purple' | 'blue' | 'yellow' | 'danger' }>) {
  return (
    <View style={[
      styles.infoCard,
      tone === 'blue' && styles.infoCardBlue,
      tone === 'yellow' && styles.infoCardYellow,
      tone === 'danger' && styles.infoCardDanger,
    ]}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardText}>{children}</Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  title: { fontSize: 38, lineHeight: 44, fontWeight: '900', color: colors.ink, letterSpacing: -1.4 },
  titleSmall: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: colors.ink, letterSpacing: -0.8 },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 24, color: colors.muted },
  eyebrow: { marginBottom: 9, fontSize: 12, fontWeight: '900', color: colors.primary, letterSpacing: 1.15, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  muted: { color: colors.muted },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  screenContent: { width: '100%', alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 36 },
  screenContentDesktop: { paddingHorizontal: 36, paddingTop: 24, paddingBottom: 56 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, transform: [{ rotate: '-5deg' }] },
  brandIconCompact: { width: 34, height: 34, borderRadius: 11 },
  brandIconInverse: { backgroundColor: colors.lime },
  brandIconText: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  brandIconTextCompact: { fontSize: 19 },
  brandIconTextInverse: { color: colors.ink },
  brandText: { color: colors.ink, fontWeight: '900', fontSize: 23, letterSpacing: -0.5 },
  brandTextCompact: { fontSize: 19 },
  brandTextInverse: { color: '#FFFFFF' },
  betaPill: { marginLeft: 2, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.lime },
  betaText: { color: colors.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  primaryButton: { minHeight: 55, borderRadius: 17, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.18, shadowRadius: 13, shadowOffset: { width: 0, height: 7 } },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  primaryButtonIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  secondaryButton: { minHeight: 53, borderRadius: 17, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong },
  secondaryButtonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  secondaryButtonIcon: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  buttonCompact: { minHeight: 43, paddingHorizontal: 15, borderRadius: 13 },
  buttonTextCompact: { fontSize: 14 },
  ghostButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  ghostButtonText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  ghostDanger: { color: colors.danger },
  buttonDisabled: { opacity: 0.42, shadowOpacity: 0 },
  buttonPressed: { opacity: 0.75, transform: [{ scale: 0.987 }] },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 13.5, fontWeight: '800', color: colors.ink },
  fieldBox: { position: 'relative' },
  field: { minHeight: 54, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, fontSize: 16, color: colors.ink },
  fieldWithSuffix: { paddingRight: 92 },
  fieldMultiline: { minHeight: 116, paddingTop: 15, textAlignVertical: 'top' },
  fieldSuffix: { position: 'absolute', right: 15, top: 18, color: colors.muted, fontSize: 13, fontWeight: '700' },
  fieldHelper: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  choiceCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 19, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 13 },
  choiceCardCompact: { minHeight: 62, paddingVertical: 10 },
  choiceCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  choiceIconText: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  choiceCopy: { flex: 1 },
  choiceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  choiceCaption: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: colors.muted },
  choiceDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#D4CDDD', alignItems: 'center', justifyContent: 'center' },
  choiceDotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  choiceCheck: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  chip: { minHeight: 43, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { color: colors.inkSoft, fontSize: 13.5, fontWeight: '700' },
  chipTextSelected: { color: colors.primaryDark },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surfaceAlt },
  pillPurple: { backgroundColor: colors.primarySoft },
  pillGood: { backgroundColor: colors.successSoft },
  pillWarning: { backgroundColor: colors.warningSoft },
  pillDanger: { backgroundColor: colors.dangerSoft },
  pillLime: { backgroundColor: colors.lime },
  pillText: { color: colors.muted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.2 },
  pillTextPurple: { color: colors.primaryDark },
  pillTextGood: { color: colors.success },
  pillTextWarning: { color: colors.warning },
  pillTextDanger: { color: colors.danger },
  pillTextLime: { color: colors.ink },
  progressTrack: { width: '100%', height: 7, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E9E4F0' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  navSafe: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  navBar: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', paddingHorizontal: 7, paddingTop: 7 },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, gap: 2 },
  navItemActive: { backgroundColor: colors.primarySoft },
  navIcon: { fontSize: 18, color: '#938B9C', fontWeight: '900' },
  navIconActive: { color: colors.primary },
  navLabel: { fontSize: 10, fontWeight: '700', color: '#938B9C' },
  navLabelActive: { color: colors.primaryDark },
  sidebar: { width: 244, minHeight: '100%', padding: 22, backgroundColor: colors.ink, borderTopRightRadius: 30, borderBottomRightRadius: 30 },
  sidebarNav: { flex: 1, marginTop: 40, gap: 7 },
  sidebarItem: { minHeight: 52, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 13 },
  sidebarItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  sidebarItemPressed: { opacity: 0.65 },
  sidebarIcon: { width: 23, textAlign: 'center', color: '#AFA6B8', fontSize: 19, fontWeight: '900' },
  sidebarLabel: { color: '#C7C0CE', fontSize: 15, fontWeight: '700' },
  sidebarTextActive: { color: '#FFFFFF' },
  sidebarBottom: { paddingTop: 17, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', flexDirection: 'row', alignItems: 'center', gap: 11 },
  sidebarAvatar: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  sidebarAvatarText: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  sidebarUserCopy: { flex: 1 },
  sidebarUserName: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
  sidebarUserHint: { marginTop: 2, color: '#AAA2B1', fontSize: 11 },
  sectionTitleRow: { marginTop: 28, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 },
  sectionTitleCopy: { flex: 1 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', letterSpacing: -0.4 },
  sectionSubtitle: { marginTop: 3, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  infoCard: { padding: 16, borderRadius: 18, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#DCD2FF' },
  infoCardBlue: { backgroundColor: colors.skySoft, borderColor: '#CDE8F9' },
  infoCardYellow: { backgroundColor: colors.yellowSoft, borderColor: '#F4E5A9' },
  infoCardDanger: { backgroundColor: colors.dangerSoft, borderColor: '#F5C9CE' },
  infoCardTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '800' },
  infoCardText: { marginTop: 5, color: colors.inkSoft, fontSize: 13, lineHeight: 19 },
});
