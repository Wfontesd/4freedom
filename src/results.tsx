import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { buildJourneyResult } from './journeys';
import { colors } from './data';
import type { AnswerValue, JourneyAnswers, JourneyDefinition } from './types';
import {
  InfoCard,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
  uiStyles,
  useResponsiveLayout,
} from './ui';

export default function JourneyResultScreen({
  journey,
  answers,
  completed,
  onEdit,
  onComplete,
  onClose,
}: {
  journey: JourneyDefinition;
  answers: JourneyAnswers;
  completed: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const result = buildJourneyResult(journey.id, answers);
  const answeredFields = journey.steps.flatMap((step) => step.fields)
    .map((field) => ({ field, value: answers[field.key] }))
    .filter(({ value }) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0));

  const saveSummary = () => {
    Alert.alert(
      'Récapitulatif préparé',
      'Dans la version connectée, ce bouton enregistrera le récapitulatif dans ton espace et permettra de l’exporter. La maquette conserve déjà tes réponses localement.',
    );
  };

  return (
    <View style={styles.page}>
      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <View style={[styles.resultIcon, { backgroundColor: journey.color }]}><Text style={styles.resultIconText}>{journey.icon}</Text></View>
        <View style={styles.heroCopy}>
          <StatusPill tone={completed ? 'good' : 'purple'}>{completed ? 'PARCOURS ENREGISTRÉ' : 'RÉCAPITULATIF PRÊT'}</StatusPill>
          <Text style={[uiStyles.title, desktop && styles.titleDesktop]}>{result.title}</Text>
          <Text style={uiStyles.subtitle}>{result.summary}</Text>
        </View>
      </View>

      {result.watchOut?.length ? (
        <InfoCard title="À vérifier avant de continuer" tone="danger">
          {result.watchOut.join('\n')}
        </InfoCard>
      ) : null}

      <View style={[styles.metrics, desktop && styles.metricsDesktop]}>
        {result.metrics.map((metric) => (
          <View key={`${metric.label}-${metric.value}`} style={[styles.metricCard, desktop && styles.metricCardDesktop]}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[
              styles.metricValue,
              metric.tone === 'good' && styles.metricGood,
              metric.tone === 'warning' && styles.metricWarning,
              metric.tone === 'danger' && styles.metricDanger,
            ]}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.resultColumns, desktop && styles.resultColumnsDesktop]}>
        <View style={[styles.panel, styles.flex]}>
          <Text style={styles.panelTitle}>Ce que tu peux faire maintenant</Text>
          <View style={styles.actionList}>
            {result.nextActions.map((action, index) => (
              <View key={action} style={styles.actionRow}>
                <View style={styles.actionNumber}><Text style={styles.actionNumberText}>{index + 1}</Text></View>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.panel, desktop && styles.answerPanel]}>
          <Text style={styles.panelTitle}>Ce que tu as renseigné</Text>
          <Text style={styles.panelIntro}>Les réponses marquées “Je ne sais pas” restent visibles pour que tu puisses les compléter plus tard.</Text>
          <View style={styles.answerList}>
            {answeredFields.slice(0, desktop ? 12 : 7).map(({ field, value }) => (
              <View key={field.key} style={styles.answerRow}>
                <Text style={styles.answerLabel}>{field.label}</Text>
                <Text style={styles.answerValue}>{formatAnswer(value as AnswerValue)}</Text>
              </View>
            ))}
            {!answeredFields.length ? <Text style={styles.emptyText}>Aucune réponse enregistrée.</Text> : null}
          </View>
          <Pressable onPress={onEdit} style={styles.editLink}><Text style={styles.editLinkText}>Modifier mes réponses</Text></Pressable>
        </View>
      </View>

      {result.preparedItems?.length ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Préparation du contact</Text>
          {result.preparedItems.map((item) => <Text key={item} style={styles.preparedItem}>• {item}</Text>)}
        </View>
      ) : null}

      <View style={styles.sourcePanel}>
        <View style={styles.sourceCopy}>
          <Text style={styles.sourceEyebrow}>SOURCE OFFICIELLE</Text>
          <Text style={styles.sourceTitle}>{journey.source.label}</Text>
          <Text style={styles.sourceDate}>Dernière vérification éditoriale : {journey.source.checkedAt}</Text>
        </View>
        <View style={styles.sourceButtons}>
          <SecondaryButton label="Ouvrir la source" icon="↗" onPress={() => void Linking.openURL(journey.source.url)} compact={desktop} />
          {journey.secondarySource ? (
            <SecondaryButton label="Voir la seconde source" icon="↗" onPress={() => void Linking.openURL(journey.secondarySource!.url)} compact={desktop} />
          ) : null}
        </View>
      </View>

      <View style={[styles.footerActions, desktop && styles.footerActionsDesktop]}>
        <View style={desktop && styles.footerButton}><SecondaryButton label="Enregistrer le récapitulatif" onPress={saveSummary} /></View>
        <View style={desktop && styles.footerButton}><PrimaryButton label={completed ? 'Retour à mes démarches' : 'Enregistrer ce parcours'} icon="→" onPress={completed ? onClose : onComplete} /></View>
      </View>
      <Text style={styles.disclaimer}>TutoVie prépare et organise. L’organisme officiel reste la source de la décision, du droit et du montant.</Text>
    </View>
  );
}

function formatAnswer(value: JourneyAnswers[string]): string {
  if (value === 'unknown') return 'Je ne sais pas encore';
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  if (Array.isArray(value)) return value.length ? `${value.length} sélection(s)` : 'Aucune sélection';
  if (typeof value === 'number') return String(value);
  return String(value ?? '—');
}

const styles = StyleSheet.create({
  page: { gap: 22, paddingBottom: 26 },
  flex: { flex: 1 },
  hero: { gap: 17 },
  heroDesktop: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  resultIcon: { width: 72, height: 72, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  resultIconText: { color: colors.ink, fontSize: 32, fontWeight: '900' },
  heroCopy: { flex: 1, gap: 4 },
  titleDesktop: { fontSize: 45, lineHeight: 50 },
  metrics: { gap: 10 },
  metricsDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCard: { padding: 16, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  metricCardDesktop: { flexGrow: 1, flexBasis: 190, minWidth: 175 },
  metricLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.55 },
  metricValue: { marginTop: 7, color: colors.ink, fontSize: 18, lineHeight: 23, fontWeight: '900' },
  metricGood: { color: colors.success },
  metricWarning: { color: colors.warning },
  metricDanger: { color: colors.danger },
  resultColumns: { gap: 14 },
  resultColumnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  panel: { padding: 19, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  answerPanel: { width: 390 },
  panelTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  panelIntro: { marginTop: 6, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  actionList: { marginTop: 15, gap: 14 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  actionNumber: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  actionNumberText: { color: colors.primaryDark, fontSize: 12, fontWeight: '900' },
  actionText: { flex: 1, color: colors.inkSoft, fontSize: 14, lineHeight: 21 },
  answerList: { marginTop: 14 },
  answerRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 3 },
  answerLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '700' },
  answerValue: { color: colors.ink, fontSize: 13.5, lineHeight: 19, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 13 },
  editLink: { marginTop: 15, alignSelf: 'flex-start', paddingVertical: 5 },
  editLinkText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  preparedItem: { marginTop: 9, color: colors.inkSoft, fontSize: 13.5, lineHeight: 20 },
  sourcePanel: { gap: 14, padding: 18, borderRadius: 22, backgroundColor: colors.skySoft, borderWidth: 1, borderColor: '#CBE8F7' },
  sourceCopy: { flex: 1 },
  sourceEyebrow: { color: '#246487', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  sourceTitle: { marginTop: 5, color: colors.ink, fontSize: 15, fontWeight: '900' },
  sourceDate: { marginTop: 3, color: colors.muted, fontSize: 11.5 },
  sourceButtons: { gap: 9 },
  footerActions: { gap: 10 },
  footerActionsDesktop: { flexDirection: 'row', justifyContent: 'flex-end' },
  footerButton: { minWidth: 260 },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
