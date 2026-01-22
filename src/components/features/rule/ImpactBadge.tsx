import { Badge } from '@/components/ui/badge'
import type { ImpactLevel } from '@/types/rule'
import { cn } from '@/lib/utils'

interface ImpactBadgeProps {
  impact: ImpactLevel
  className?: string
}

const impactStyles: Record<ImpactLevel, string> = {
  CRITICAL: 'bg-red-600 text-white hover:bg-red-600',
  HIGH: 'bg-orange-500 text-white hover:bg-orange-500',
  MEDIUM: 'bg-yellow-500 text-white hover:bg-yellow-500',
  'MEDIUM-HIGH': 'bg-orange-400 text-white hover:bg-orange-400',
  LOW: 'bg-gray-500 text-white hover:bg-gray-500',
  'LOW-MEDIUM': 'bg-gray-400 text-white hover:bg-gray-400',
}

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
  return (
    <Badge className={cn(impactStyles[impact], 'shrink-0', className)}>
      {impact}
    </Badge>
  )
}
