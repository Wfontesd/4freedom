import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { housingOptions, needOptions, studyStatusOptions, colors } from './data';
import type { AppSnapshot, NeedId, UserProfile } from './types';
import {
  BrandMark,
  ChoiceCard,
  Field,
  GhostButton,
  InfoCard,
  PrimaryButton,
  ProgressBar,
  ScreenShell,
  SecondaryButton,
  StatusPill,
  uiStyles,
  useResponsiveLayout,
} from './ui';

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.splash}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}><BrandMark /></Animated.View>
      <Text style={styles.centerMuted}>On prépare le mode d’emploi.</Text>
    </View>
  );
}

export function WelcomeScreen({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const { desktop } = useResponsiveLayout();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -7, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float]);

  return (
    <ScreenShell contentStyle={[styles.welcome, desktop && styles.welcomeDesktop]} maxWidth={1240}>
      <View style={[styles.welcomeCopy, desktop && styles.welcomeCopyDesktop]}>
        <BrandMark />
        <View style={styles.welcomeText}>
          <StatusPill tone="lime">LE MODE D’EMPLOI QUI MANQUAIT</StatusPill>
          <Text style={[styles.heroTitle, desktop && styles.heroTitleDesktop]}>Personne ne t’explique vraiment les démarches. TutoVie le fait, pas à pas.</Text>
          <Text style={[uiStyles.subtitle, desktop && styles.heroSubtitle]}>Logement, aides, documents, santé et impôts : tu réponds à ce que tu sais, on t’aide pour le reste, puis on te donne la prochaine action utile.</Text>
        </View>
        <View style={[styles.actions, desktop && styles.actionsDesktop]}>
          <View style={desktop && styles.actionButtonDesktop}><PrimaryButton label="Créer mon parcours" icon="→" onPress={onStart} /></View>
          <View style={desktop && styles.actionButtonDesktop}><SecondaryButton label="Explorer sans compte" onPress={onDemo} /></View>
        </View>
        <Text style={styles.privacyNote}>Maquette locale : aucune donnée personnelle n’est envoyée.</Text>
      </View>

      <Animated.View style={[styles.welcomeVisual, desktop && styles.welcomeVisualDesktop, { transform: [{ translateY: float }] }]}>
        <View style={styles.visualBackground} />
        <View style={[styles.floatingCard, styles.cardBudget]}>
          <Text style={styles.floatingEyebrow}>BUDGET LOGEMENT</Text>
          <Text style={styles.floatingTitle}>On calcule ensemble</Text>
          <Text style={styles.floatingText}>Même si tu ne connais pas encore toutes les dépenses.</Text>
        </View>
        <View style={[styles.floatingCard, styles.cardDocs]}>
          <Text style={styles.floatingEyebrow}>DOSSIER LOCATIF</Text>
          <Text style={styles.floatingTitle}>4 pièces à préparer</Text>
          <Text style={styles.floatingText}>Chaque document est expliqué.</Text>
        </View>
        <View style={styles.visualCenter}>
          <Text style={styles.visualCenterMark}>?</Text>
          <Text style={styles.visualCenterLabel}>Tu pars d’où tu en es.</Text>
        </View>
        <View style={[styles.floatingCard, styles.cardNext]}>
          <Text style={styles.floatingEyebrow}>PROCHAINE ACTION</Text>
          <Text style={styles.floatingTitle}>Vérifier Visale</Text>
          <Text style={styles.floatingText}>Avant la signature du bail.</Text>
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

export function AuthScreen({
  email,
  onEmail,
  onBack,
  onContinue,
}: {
  email: string;
  onEmail: (email: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const validEmail = email.trim().includes('@') && email.trim().includes('.');

  return (
    <ScreenShell contentStyle={[styles.authPage, desktop && styles.authPageDesktop]} maxWidth={1120}>
      <View style={[styles.authIntro, desktop && styles.authIntroDesktop]}>
        <View style={styles.topRow}><GhostButton label="← Retour" onPress={onBack} /><BrandMark compact /></View>
        <View style={styles.authIntroText}>
          <Text style={uiStyles.eyebrow}>CONNEXION</Text>
          <Text style={[uiStyles.title, desktop && styles.desktopHeading]}>Retrouve ton parcours sur tous tes appareils.</Text>
          <Text style={uiStyles.subtitle}>La connexion est maquettée. Le lien magique, Google et Apple seront branchés au backend sans changer ce parcours.</Text>
        </View>
        {desktop ? (
          <View style={styles.authBenefits}>
            <BenefitLine title="Continuer plus tard" text="Tes réponses et tes brouillons seront synchronisés." />
            <BenefitLine title="Recevoir les rappels utiles" text="Échéance, pièce manquante ou réponse attendue uniquement." />
            <BenefitLine title="Garder le contrôle" text="Export et suppression des données prévus dès la bêta." />
          </View>
        ) : null}
      </View>

      <View style={[styles.authCard, desktop && styles.authCardDesktop]}>
        <Text style={styles.cardHeading}>Continuer avec ton e-mail</Text>
        <Text style={styles.cardDescription}>Aucun mot de passe : tu recevras un lien temporaire.</Text>
        <Field
          label="Adresse e-mail"
          value={email}
          onChangeText={onEmail}
          placeholder="prenom@ecole.fr"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          helper="Dans cette maquette, aucun message n’est réellement envoyé."
        />
        <PrimaryButton label="Recevoir mon lien de connexion" icon="→" onPress={onContinue} disabled={!validEmail} />
        <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>ou</Text><View style={styles.orLine} /></View>
        <SecondaryButton label="Continuer avec Google" icon="G" onPress={onContinue} />
        <SecondaryButton label="Continuer avec Apple" icon="●" onPress={onContinue} />
        <Pressable onPress={onContinue} style={styles.authSkip}><Text style={styles.authSkipText}>Continuer sans compte pour le moment</Text></Pressable>
      </View>
    </ScreenShell>
  );
}

function BenefitLine({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.benefitLine}>
      <View style={styles.benefitCheck}><Text style={styles.benefitCheckText}>✓</Text></View>
      <View style={styles.flex}><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.benefitText}>{text}</Text></View>
    </View>
  );
}

export function OnboardingScreen({
  snapshot,
  patch,
  patchProfile,
  onFinish,
}: {
  snapshot: AppSnapshot;
  patch: (next: Partial<AppSnapshot>) => void;
  patchProfile: (next: Partial<UserProfile>) => void;
  onFinish: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const step = snapshot.onboardingStep;
  const profile = snapshot.profile;
  const total = 4;

  const canContinue = useMemo(() => {
    if (step === 0) return profile.firstName.trim().length >= 2 && profile.age.trim().length > 0 && profile.city.trim().length >= 2;
    if (step === 1) return Boolean(profile.studyStatus);
    if (step === 2) return Boolean(profile.housingStatus);
    return profile.needs.length > 0;
  }, [profile, step]);

  const toggleNeed = (id: NeedId) => {
    patchProfile({ needs: profile.needs.includes(id) ? profile.needs.filter((item) => item !== id) : [...profile.needs, id] });
  };

  const goBack = () => {
    if (step === 0) patch({ stage: 'welcome' });
    else patch({ onboardingStep: step - 1 });
  };

  const goNext = () => {
    if (step === total - 1) onFinish();
    else patch({ onboardingStep: step + 1 });
  };

  return (
    <ScreenShell contentStyle={[styles.onboardingPage, desktop && styles.onboardingPageDesktop]} maxWidth={1180}>
      <View style={[styles.onboardingNav, desktop && styles.onboardingNavDesktop]}>
        <GhostButton label={step === 0 ? '← Accueil' : '← Étape précédente'} onPress={goBack} />
        <BrandMark compact />
        <Text style={styles.stepCount}>{step + 1} / {total}</Text>
      </View>

      <View style={[styles.onboardingBody, desktop && styles.onboardingBodyDesktop]}>
        {desktop ? (
          <View style={styles.onboardingAside}>
            <Text style={styles.asideEyebrow}>TON PARCOURS PERSONNEL</Text>
            <Text style={styles.asideTitle}>On pose seulement les questions qui changent vraiment les démarches.</Text>
            <Text style={styles.asideText}>Tu pourras modifier chaque réponse plus tard. “Je ne sais pas” reste toujours une réponse valable dans les guides.</Text>
            <View style={styles.asideProgress}>
              {[0, 1, 2, 3].map((item) => (
                <View key={item} style={styles.asideProgressRow}>
                  <View style={[styles.asideDot, item < step && styles.asideDotDone, item === step && styles.asideDotActive]}>
                    <Text style={[styles.asideDotText, item <= step && styles.asideDotTextActive]}>{item < step ? '✓' : item + 1}</Text>
                  </View>
                  <Text style={[styles.asideProgressLabel, item === step && styles.asideProgressLabelActive]}>{['Ton profil', 'Tes études', 'Ton logement', 'Tes priorités'][item]}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={[styles.onboardingMain, desktop && styles.onboardingMainDesktop]}>
          {!desktop ? <ProgressBar value={(step + 1) / total} /> : null}
          <View style={styles.onboardingHeading}>
            <Text style={uiStyles.eyebrow}>{['D’ABORD, TOI', 'TA SITUATION', 'TON LOGEMENT', 'CE QU’ON VA RÉGLER'][step]}</Text>
            <Text style={uiStyles.title}>{[
              'On fait connaissance ?',
              'Tu étudies dans quel cadre ?',
              'Tu en es où pour le logement ?',
              'Qu’est-ce qui te prend la tête en ce moment ?',
            ][step]}</Text>
            <Text style={uiStyles.subtitle}>{[
              'Juste assez d’informations pour ne pas te donner des conseils génériques.',
              'Certains documents et interlocuteurs dépendent de ton statut.',
              'L’ordre des démarches change selon que tu cherches, signes ou habites déjà quelque part.',
              'Choisis tout ce qui te concerne. Ton accueil montrera les prochaines actions les plus utiles.',
            ][step]}</Text>
          </View>

          {step === 0 ? (
            <View style={styles.formStack}>
              <Field label="Ton prénom" value={profile.firstName} onChangeText={(firstName) => patchProfile({ firstName })} placeholder="Lina" />
              <View style={[styles.formRow, !desktop && styles.formRowMobile]}>
                <View style={styles.formColumn}><Field label="Ton âge" value={profile.age} onChangeText={(age) => patchProfile({ age: age.replace(/\D/g, '').slice(0, 2) })} placeholder="19" keyboardType="numeric" suffix="ans" /></View>
                <View style={styles.formColumn}><Field label="Ta ville d’études" value={profile.city} onChangeText={(city) => patchProfile({ city })} placeholder="Lyon" helper="Tu pourras la changer si tu déménages." /></View>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={[styles.choiceList, desktop && styles.choiceGrid]}>
              {studyStatusOptions.map((option) => (
                <View key={option.id} style={desktop && styles.choiceGridItem}>
                  <ChoiceCard selected={profile.studyStatus === option.id} title={option.label} caption={option.caption} onPress={() => patchProfile({ studyStatus: option.id })} />
                </View>
              ))}
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.formStack}>
              <View style={[styles.choiceList, desktop && styles.choiceGrid]}>
                {housingOptions.map((option) => (
                  <View key={option.id} style={desktop && styles.choiceGridItem}>
                    <ChoiceCard selected={profile.housingStatus === option.id} icon={option.emoji} title={option.label} caption={option.caption} onPress={() => patchProfile({ housingStatus: option.id })} />
                  </View>
                ))}
              </View>
              <InfoCard title="Tu vis seul·e ?" tone="blue">Cette information aide seulement à adapter les exemples de budget et de logement.</InfoCard>
              <View style={styles.chipRow}>
                {[
                  { id: 'yes', label: 'Oui' },
                  { id: 'no', label: 'Non, en couple ou en coloc' },
                  { id: 'unknown', label: 'Je ne sais pas encore' },
                ].map((option) => (
                  <Pressable key={option.id} onPress={() => patchProfile({ livesAlone: option.id as UserProfile['livesAlone'] })} style={[styles.smallChoice, profile.livesAlone === option.id && styles.smallChoiceSelected]}>
                    <Text style={[styles.smallChoiceText, profile.livesAlone === option.id && styles.smallChoiceTextSelected]}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={[styles.choiceList, desktop && styles.choiceGrid]}>
              {needOptions.map((option) => (
                <View key={option.id} style={desktop && styles.choiceGridItem}>
                  <ChoiceCard selected={profile.needs.includes(option.id)} icon={option.emoji} title={option.label} caption={option.caption} onPress={() => toggleNeed(option.id)} />
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.onboardingActions, desktop && styles.onboardingActionsDesktop]}>
            <PrimaryButton label={step === total - 1 ? 'Préparer mon espace TutoVie' : 'Continuer'} icon="→" onPress={goNext} disabled={!canContinue} />
            {step === 3 ? <Text style={styles.centerMuted}>Tu pourras lancer les autres guides à tout moment.</Text> : null}
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

export function PreparingScreen({ onDone }: { onDone: () => void }) {
  const progress = useRef(new Animated.Value(0.03)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.loop(Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ]), { iterations: 2 }),
    ]).start();
    const timer = setTimeout(onDone, 1950);
    return () => clearTimeout(timer);
  }, [onDone, opacity, progress]);

  return (
    <ScreenShell scroll={false} contentStyle={styles.preparing} maxWidth={680}>
      <Animated.View style={[styles.preparingMark, { opacity }]}><Text style={styles.preparingMarkText}>T</Text></Animated.View>
      <Text style={uiStyles.titleSmall}>On prépare ton espace.</Text>
      <Text style={styles.centerMuted}>On classe les guides, les documents et les prochaines actions selon tes réponses.</Text>
      <View style={styles.preparingProgress}><ProgressBar value={0} animatedValue={progress} /></View>
      <Text style={styles.preparingDetail}>Aucune éligibilité n’est décidée automatiquement. Les guides renvoient vers les sources officielles.</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.canvas },
  centerMuted: { color: colors.muted, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  welcome: { minHeight: '100%', justifyContent: 'space-between', gap: 34, paddingTop: 14 },
  welcomeDesktop: { minHeight: 760, flexDirection: 'row', alignItems: 'center', gap: 72, paddingTop: 40 },
  welcomeCopy: { gap: 32 },
  welcomeCopyDesktop: { flex: 1, maxWidth: 580, justifyContent: 'center' },
  welcomeText: { gap: 4 },
  heroTitle: { marginTop: 17, color: colors.ink, fontSize: 41, lineHeight: 45, fontWeight: '900', letterSpacing: -1.6 },
  heroTitleDesktop: { fontSize: 60, lineHeight: 64, letterSpacing: -2.6 },
  heroSubtitle: { maxWidth: 570, fontSize: 18, lineHeight: 28 },
  actions: { gap: 11 },
  actionsDesktop: { flexDirection: 'row', alignItems: 'center' },
  actionButtonDesktop: { minWidth: 205 },
  privacyNote: { color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  welcomeVisual: { height: 345, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  welcomeVisualDesktop: { flex: 1, height: 610, minWidth: 510 },
  visualBackground: { position: 'absolute', width: '84%', height: '78%', borderRadius: 50, backgroundColor: '#EDE6FF', transform: [{ rotate: '-5deg' }] },
  visualCenter: { width: 175, height: 175, borderRadius: 54, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
  visualCenterMark: { color: '#FFFFFF', fontSize: 76, lineHeight: 82, fontWeight: '900' },
  visualCenterLabel: { marginTop: -5, color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  floatingCard: { position: 'absolute', width: 188, padding: 15, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, shadowColor: '#392C47', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  cardBudget: { left: 0, top: 18 },
  cardDocs: { right: 0, top: 82 },
  cardNext: { left: 35, bottom: 8 },
  floatingEyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  floatingTitle: { marginTop: 5, color: colors.ink, fontSize: 15, fontWeight: '900' },
  floatingText: { marginTop: 4, color: colors.muted, fontSize: 11.5, lineHeight: 16 },
  authPage: { minHeight: '100%', gap: 36 },
  authPageDesktop: { minHeight: 760, flexDirection: 'row', alignItems: 'center', gap: 75, paddingTop: 38 },
  authIntro: { gap: 28 },
  authIntroDesktop: { flex: 1, maxWidth: 520 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  authIntroText: { gap: 2 },
  desktopHeading: { fontSize: 48, lineHeight: 53 },
  authBenefits: { gap: 17 },
  benefitLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitCheck: { width: 25, height: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSoft },
  benefitCheckText: { color: colors.success, fontWeight: '900' },
  benefitTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  benefitText: { marginTop: 3, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  authCard: { gap: 14, padding: 19, borderRadius: 25, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  authCardDesktop: { width: 430, padding: 28, borderRadius: 30, shadowColor: '#332A3A', shadowOpacity: 0.08, shadowRadius: 25, shadowOffset: { width: 0, height: 15 } },
  cardHeading: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  cardDescription: { marginTop: -7, marginBottom: 5, color: colors.muted, fontSize: 13, lineHeight: 19 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { color: colors.muted, fontSize: 12 },
  authSkip: { alignItems: 'center', paddingVertical: 9 },
  authSkipText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  onboardingPage: { minHeight: '100%' },
  onboardingPageDesktop: { paddingTop: 24 },
  onboardingNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  onboardingNavDesktop: { paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: colors.line },
  stepCount: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  onboardingBody: { marginTop: 22 },
  onboardingBodyDesktop: { flexDirection: 'row', gap: 50, marginTop: 38, alignItems: 'flex-start' },
  onboardingAside: { width: 285, padding: 24, borderRadius: 27, backgroundColor: colors.ink },
  asideEyebrow: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  asideTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '900' },
  asideText: { marginTop: 12, color: '#C8C0CF', fontSize: 13, lineHeight: 20 },
  asideProgress: { marginTop: 28, gap: 15 },
  asideProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  asideDot: { width: 28, height: 28, borderRadius: 10, borderWidth: 1, borderColor: '#5B5360', alignItems: 'center', justifyContent: 'center' },
  asideDotDone: { backgroundColor: '#3A3340' },
  asideDotActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  asideDotText: { color: '#938B9B', fontSize: 11, fontWeight: '900' },
  asideDotTextActive: { color: colors.ink },
  asideProgressLabel: { color: '#9E96A5', fontSize: 13 },
  asideProgressLabelActive: { color: '#FFFFFF', fontWeight: '800' },
  onboardingMain: { gap: 28 },
  onboardingMainDesktop: { flex: 1, maxWidth: 760 },
  onboardingHeading: { marginTop: 15 },
  formStack: { gap: 20 },
  formRow: { flexDirection: 'row', gap: 14 },
  formRowMobile: { flexDirection: 'column' },
  formColumn: { flex: 1 },
  choiceList: { gap: 11 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
  choiceGridItem: { flexGrow: 1, flexBasis: 310, minWidth: 280, maxWidth: 370 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  smallChoice: { minHeight: 43, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  smallChoiceSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  smallChoiceText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  smallChoiceTextSelected: { color: colors.primaryDark },
  onboardingActions: { gap: 12, paddingTop: 4 },
  onboardingActionsDesktop: { maxWidth: 350 },
  preparing: { flex: 1, minHeight: 620, alignItems: 'center', justifyContent: 'center', gap: 16 },
  preparingMark: { width: 100, height: 100, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  preparingMarkText: { color: '#FFFFFF', fontSize: 53, fontWeight: '900' },
  preparingProgress: { width: '100%', maxWidth: 430, marginTop: 10 },
  preparingDetail: { maxWidth: 450, color: colors.muted, fontSize: 11.5, lineHeight: 17, textAlign: 'center' },
});
