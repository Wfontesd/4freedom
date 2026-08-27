import type { PropsWithChildren, ReactNode } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './data';
import type { AppTab } from './types';

export const NAV_ITEMS: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '⌂' },
  { id: 'journeys', label: 'Parcours', icon: '≡' },
  { id: 'documents', label: 'Documents', icon: '▣' },
  { id: 'assistant', label: 'Assistant', icon: '✦' },
  { id: 'profile', label: 'Profil', icon: '●' },
];

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, compact && styles.brandIconCompact]}>
        <Text style={[styles.brandIconText, compact && styles.brandIconTextCompact]}>T</Text>
      </View>
      <Text style={[styles.brandText, compact && styles.brandTextCompact, inverse && styles.brandTextInverse]}>TutoVie</Text>
      {!compact ? <View style={styles.betaPill}><Text style={styles.betaText}>BÊTA</Text></View> : null}
    </View>
  );
}

export function ScreenShell({
  children,
  scroll = true,
  contentStyle,
  maxWidth = 1180,
}: PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle; maxWidth?: number }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.screenContent, { maxWidth }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, styles.flex, { maxWidth }, contentStyle]}>{children}</View>
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
      <Text style={styles.primaryButtonText}>{label}{icon ? `  ${icon}` : ''}</Text>
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
      <Text style={styles.secondaryButtonText}>{icon ? `${icon}  ` : ''}{label}</Text>
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

export function Field(props: TextInputProps & { label: string; hint?: string; suffix?: string }) {
  const { label, hint, suffix, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput
          placeholderTextColor="#9C95A5"
          {...inputProps}
          style={[styles.field, inputProps.multiline && styles.fieldMultiline, suffix ? styles.fieldWithSuffix : null, inputProps.style]}
        />
        {suffix ? <Text style={styles.fieldSuffix}>{suffix}</Text> : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function ChoiceCard({
  selected,
  onPress,
  emoji,
  title,
  caption,
  compact = false,
}: {
  selected: boolean;
  onPress: () => void;
  emoji?: string;
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
      {emoji ? <Text style={styles.choiceEmoji}>{emoji}</Text> : null}
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {caption ? <Text style={styles.choiceCaption}>{caption}</Text> : null}
      </View>
      <View style={[styles.choiceDot, selected && styles.choiceDotSelected]}>{selected ? <Text style={styles.choiceCheck}>✓</Text> : null}</View>
    </Pressable>
  );
}

export function CheckboxRow({ checked, label, hint, onPress }: { checked: boolean; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.checkboxRow, checked && styles.checkboxRowChecked, pressed && styles.buttonPressed]}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked ? <Text style={styles.checkboxTick}>✓</Text> : null}</View>
      <View style={styles.choiceCopy}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        {hint ? <Text style={styles.choiceCaption}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

export function Pill({ children, tone = 'purple' }: PropsWithChildren<{ tone?: 'purple' | 'neutral' | 'warning' | 'success' | 'dark' }>) {
  return (
    <View style={[
      styles.pill,
      tone === 'neutral' && styles.pillNeutral,
      tone === 'warning' && styles.pillWarning,
      tone === 'success' && styles.pillSuccess,
      tone === 'dark' && styles.pillDark,
    ]}>
      <Text style={[
        styles.pillText,
        tone === 'neutral' && styles.pillTextNeutral,
        tone === 'warning' && styles.pillTextWarning,
        tone === 'success' && styles.pillTextSuccess,
        tone === 'dark' && styles.pillTextDark,
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

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
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

export function MobileNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.navSafe}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
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

export function DesktopNav({ active, onChange, onLogo }: { active: AppTab; onChange: (tab: AppTab) => void; onLogo: () => void }) {
  return (
    <View style={styles.desktopNav}>
      <Pressable onPress={onLogo}><BrandMark compact inverse /></Pressable>
      <View style={styles.desktopNavItems}>
        {NAV_ITEMS.map((item) => {
          const selected = item.id === active;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={({ pressed }) => [styles.desktopNavItem, selected && styles.desktopNavItemActive, pressed && styles.desktopNavPressed]}
            >
              <Text style={[styles.desktopNavIcon, selected && styles.desktopNavIconActive]}>{item.icon}</Text>
              <Text style={[styles.desktopNavLabel, selected && styles.desktopNavLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.desktopNote}>
        <Text style={styles.desktopNoteTitle}>Prototype local</Text>
        <Text style={styles.desktopNoteText}>Les appels, dépôts et analyses sont simulés. L’interface est prête à être branchée.</Text>
      </View>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  title: { fontSize: 36, lineHeight: 42, fontWeight: '900', color: colors.ink, letterSpacing: -1.2 },
  titleSmall: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: colors.ink, letterSpacing: -0.7 },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 24, color: colors.muted },
  eyebrow: { marginBottom: 10, fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  muted: { color: colors.muted },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  screenContent: { width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 42 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, transform: [{ rotate: '-5deg' }] },
  brandIconCompact: { width: 34, height: 34, borderRadius: 11 },
  brandIconText: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  brandIconTextCompact: { fontSize: 19 },
  brandText: { color: colors.ink, fontWeight: '900', fontSize: 23, letterSpacing: -0.5 },
  brandTextCompact: { fontSize: 19 },
  brandTextInverse: { color: '#FFFFFF' },
  betaPill: { marginLeft: 3, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.lime },
  betaText: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  primaryButton: { minHeight: 54, borderRadius: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800' },
  secondaryButton: { minHeight: 52, borderRadius: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  secondaryButtonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  buttonCompact: { minHeight: 44, paddingHorizontal: 15, borderRadius: 14 },
  ghostButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  ghostButtonText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  ghostDanger: { color: colors.danger },
  buttonDisabled: { opacity: 0.4, shadowOpacity: 0 },
  buttonPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  fieldBox: { position: 'relative' },
  field: { width: '100%', minHeight: 54, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, fontSize: 16, color: colors.ink },
  fieldMultiline: { minHeight: 124, paddingTop: 15, textAlignVertical: 'top' },
  fieldWithSuffix: { paddingRight: 50 },
  fieldSuffix: { position: 'absolute', right: 16, top: 17, color: colors.muted, fontWeight: '800' },
  fieldHint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  choiceCard: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 18, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 13 },
  choiceCardCompact: { minHeight: 62, paddingVertical: 10 },
  choiceCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceEmoji: { fontSize: 27 },
  choiceCopy: { flex: 1 },
  choiceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  choiceCaption: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: colors.muted },
  choiceDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#D4CEDD', alignItems: 'center', justifyContent: 'center' },
  choiceDotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  choiceCheck: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  checkboxRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 12 },
  checkboxRowChecked: { backgroundColor: '#F2FBF6', borderColor: '#BFE5CF' },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: '#C9C2D2', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked: { borderColor: colors.success, backgroundColor: colors.success },
  checkboxTick: { color: '#FFFFFF', fontWeight: '900' },
  checkboxLabel: { fontSize: 14.5, color: colors.ink, fontWeight: '700' },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.primarySoft },
  pillNeutral: { backgroundColor: '#F0EDF3' },
  pillWarning: { backgroundColor: '#FFF0D7' },
  pillSuccess: { backgroundColor: '#E5F8EE' },
  pillDark: { backgroundColor: colors.dark },
  pillText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  pillTextNeutral: { color: colors.muted },
  pillTextWarning: { color: colors.warning },
  pillTextSuccess: { color: colors.success },
  pillTextDark: { color: '#FFFFFF' },
  progressTrack: { width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E9E4F0' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  sectionTitleRow: { marginTop: 28, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 15 },
  sectionTitleCopy: { flex: 1 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', letterSpacing: -0.35 },
  sectionSubtitle: { marginTop: 4, color: colors.muted, fontSize: 13, lineHeight: 18 },
  navSafe: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  navBar: { width: '100%', maxWidth: 720, alignSelf: 'center', flexDirection: 'row', paddingHorizontal: 8, paddingTop: 7 },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, gap: 2 },
  navItemActive: { backgroundColor: colors.primarySoft },
  navIcon: { fontSize: 18, color: '#958E9F', fontWeight: '900' },
  navIconActive: { color: colors.primary },
  navLabel: { fontSize: 9.5, fontWeight: '700', color: '#958E9F' },
  navLabelActive: { color: colors.primaryDark },
  desktopNav: { width: 238, paddingHorizontal: 18, paddingVertical: 24, backgroundColor: colors.dark, gap: 26 },
  desktopNavItems: { gap: 7 },
  desktopNavItem: { minHeight: 48, borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  desktopNavItemActive: { backgroundColor: 'rgba(255,255,255,0.11)' },
  desktopNavPressed: { opacity: 0.72 },
  desktopNavIcon: { width: 24, color: '#AAA2B5', fontSize: 18, textAlign: 'center', fontWeight: '900' },
  desktopNavIconActive: { color: colors.lime },
  desktopNavLabel: { color: '#BEB7C7', fontSize: 14.5, fontWeight: '700' },
  desktopNavLabelActive: { color: '#FFFFFF' },
  desktopNote: { marginTop: 'auto', borderRadius: 17, padding: 14, backgroundColor: 'rgba(255,255,255,0.07)' },
  desktopNoteTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  desktopNoteText: { marginTop: 5, color: '#BEB7C7', fontSize: 11.5, lineHeight: 17 },
});
