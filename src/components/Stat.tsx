import type { ReactNode } from 'react'

type StatProps = { icon: ReactNode; label: string; value: string | number; detail: string; tone?: string }

export function Stat({ icon, label, value, detail, tone = '' }: StatProps) {
  return <div className="stat-card"><div className={'stat-icon ' + tone}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></div>
}
