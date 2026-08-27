import type { PropsWithChildren, ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './data';
import type { AppTab } from './types';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, compact && styles.brandIconCompact]}>
        <Text style={[styles.brandIconText, compact && styles.brandIconTextCompact]}>T</Text>
      </View>
      <Text style={[styles.brandText, compact && styles.brandTextCompact]}>TutoVie</Text>
      {!compact ? <View style={styles.betaPill}><Text style={styles.betaText}>BÊTA</Text></View> : null}
    </View>
  );
}

export function ScreenShell({ children, scroll = true, contentStyle }: PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.screenContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.buttonDisabled, pressed && !disabled && styles.buttonPressed]}
    >
      <Text style={styles.primaryButtonText}>{icon ? `${icon}  ` : ''}{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      <Text style={styles.secondaryButtonText}>{icon ? `${icon}  ` : ''}{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed]}>
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string; hint?: string }) {
  const { label, hint, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#A19AAA"
        {...inputProps}
        style={[styles.field, inputProps.multiline && styles.fieldMultiline, inputProps.style]}
      />
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

export function Pill({ children, tone = 'purple' }: PropsWithChildren<{ tone?: 'purple' | 'lime' | 'neutral' | 'warning' | 'success' }>) {
  return (
    <View style={[styles.pill, tone === 'lime' && styles.pillLime, tone === 'neutral' && styles.pillNeutral, tone === 'warning' && styles.pillWarning, tone === 'success' && styles.pillSuccess]}>
      <Text style={[styles.pillText, tone === 'lime' && styles.pillTextDark, tone === 'neutral' && styles.pillTextNeutral, tone === 'warning' && styles.pillTextWarning, tone === 'success' && styles.pillTextSuccess]}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ value, animatedValue }: { value: number; animatedValue?: Animated.Value }) {
  const width = animatedValue
    ? animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
    : `${Math.max(0, Math.min(1, value)) * 100}%`;
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width }]} />
    </View>
  );
}

const navItems: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '⌂' },
  { id: 'roadmap', label: 'Parcours', icon: '✓' },
  { id: 'assistant', label: 'Assistant', icon: '✦' },
  { id: 'vault', label: 'Coffre', icon: '▣' },
  { id: 'profile', label: 'Profil', icon: '●' },
];

export function BottomNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
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

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  title: { fontSize: 34, lineHeight: 39, fontWeight: '900', color: colors.ink, letterSpacing: -1.1 },
  titleSmall: { fontSize: 27, lineHeight: 33, fontWeight: '900', color: colors.ink, letterSpacing: -0.7 },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 24, color: colors.muted },
  eyebrow: { marginBottom: 10, fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 1.2, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  muted: { color: colors.muted },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  screenContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 34 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, transform: [{ rotate: '-5deg' }] },
  brandIconCompact: { width: 34, height: 34, borderRadius: 11 },
  brandIconText: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  brandIconTextCompact: { fontSize: 19 },
  brandText: { color: colors.ink, fontWeight: '900', fontSize: 23, letterSpacing: -0.5 },
  brandTextCompact: { fontSize: 19 },
  betaPill: { marginLeft: 3, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.lime },
  betaText: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  primaryButton: { minHeight: 54, borderRadius: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { minHeight: 52, borderRadius: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  secondaryButtonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  ghostButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  ghostButtonText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  buttonDisabled: { opacity: 0.4, shadowOpacity: 0 },
  buttonPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  fieldWrap: { gap: 7 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  field: { minHeight: 54, paddingHorizontal: 16, borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, fontSize: 16, color: colors.ink },
  fieldMultiline: { minHeight: 110, paddingTop: 15, textAlignVertical: 'top' },
  fieldHint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  choiceCard: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 20, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 13 },
  choiceCardCompact: { minHeight: 62, paddingVertical: 10 },
  choiceCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceEmoji: { fontSize: 27 },
  choiceCopy: { flex: 1 },
  choiceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  choiceCaption: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: colors.muted },
  choiceDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#D4CEDD', alignItems: 'center', justifyContent: 'center' },
  choiceDotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  choiceCheck: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.primarySoft },
  pillLime: { backgroundColor: colors.lime },
  pillNeutral: { backgroundColor: '#F0EDF3' },
  pillWarning: { backgroundColor: '#FFF0D7' },
  pillSuccess: { backgroundColor: '#E5F8EE' },
  pillText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  pillTextDark: { color: colors.ink },
  pillTextNeutral: { color: colors.muted },
  pillTextWarning: { color: colors.warning },
  pillTextSuccess: { color: colors.success },
  progressTrack: { width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E9E4F0' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  navSafe: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line },
  navBar: { width: '100%', maxWidth: 720, alignSelf: 'center', flexDirection: 'row', paddingHorizontal: 8, paddingTop: 7 },
  navItem: { flex: 1, minHeight: 53, alignItems: 'center', justifyContent: 'center', borderRadius: 15, gap: 2 },
  navItemActive: { backgroundColor: colors.primarySoft },
  navIcon: { fontSize: 18, color: '#958E9F', fontWeight: '900' },
  navIconActive: { color: colors.primary },
  navLabel: { fontSize: 10, fontWeight: '700', color: '#958E9F' },
  navLabelActive: { color: colors.primaryDark },
  sectionTitleRow: { marginTop: 25, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.35 },
});
