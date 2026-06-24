import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Predictor',
  description:
    'Run the calibrated 17-feature ML model on any hypothetical World Cup 2026 matchup. ' +
    'Live win/draw/loss probabilities accounting for ELO, squad strength, and rolling form.',
  openGraph: {
    title: 'Match Predictor · WC 2026 Intelligence',
    description: 'Live ML-powered match predictions for FIFA World Cup 2026.',
  },
}

export default function PredictorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
