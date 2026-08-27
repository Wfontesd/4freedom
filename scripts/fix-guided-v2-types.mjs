import fs from 'node:fs';

function replace(path, from, to) {
  const current = fs.readFileSync(path, 'utf8');
  if (!current.includes(from)) {
    throw new Error(`Pattern not found in ${path}: ${from.slice(0, 120)}`);
  }
  fs.writeFileSync(path, current.replace(from, to), 'utf8');
}

replace(
  'src/ui.tsx',
  "  type TextInputProps,\n  type ViewStyle,",
  "  type StyleProp,\n  type TextInputProps,\n  type ViewStyle,",
);
replace(
  'src/ui.tsx',
  "PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle | ViewStyle[]; maxWidth?: number }>",
  "PropsWithChildren<{ scroll?: boolean; contentStyle?: StyleProp<ViewStyle>; maxWidth?: number }>",
);
replace(
  'src/journeys.ts',
  "    summary: contacts[category] ?? contacts.other,",
  "    summary: contacts[category] ?? contacts.other ?? 'Annuaire Service-Public pour identifier le service compétent',",
);
replace(
  'src/results.tsx',
  "import type { JourneyAnswers, JourneyDefinition } from './types';",
  "import type { AnswerValue, JourneyAnswers, JourneyDefinition } from './types';",
);
replace(
  'src/results.tsx',
  "{formatAnswer(value)}",
  "{formatAnswer(value as AnswerValue)}",
);
replace(
  'src/screens.tsx',
  "  const active = recommended.find((journey) => snapshot.journeyProgress[journey.id]?.status !== 'completed') ?? recommended[0] ?? journeys[0];",
  "  const active = recommended.find((journey) => snapshot.journeyProgress[journey.id]?.status !== 'completed') ?? recommended[0] ?? journeys[0]!;",
);
replace(
  'src/screens.tsx',
  "  modalDismiss: { ...StyleSheet.absoluteFillObject },",
  "  modalDismiss: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },",
);

console.log('Applied guided V2 TypeScript fixes.');
