import { useTranslation } from 'react-i18next'
import { useParams, Navigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getRuleById, getCategoryById } from '@/data'
import { ImpactBadge } from '@/components/features/rule/ImpactBadge'
import { CodeBlock } from '@/components/features/rule/CodeBlock'

export function RulePage() {
  const { t } = useTranslation()
  const { lang, category: categoryId, rule: ruleId } = useParams()

  const category = getCategoryById(categoryId || '')
  const rule = getRuleById(categoryId || '', ruleId || '')

  if (!category || !rule) {
    return <Navigate to={`/${lang}`} replace />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/${lang}/${category.id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t(`categories.${category.id}.title`)}
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{rule.title}</h1>
          <ImpactBadge impact={rule.impact} />
        </div>

        {rule.impactDescription && (
          <p className="text-sm text-muted-foreground">
            Impact: {rule.impactDescription}
          </p>
        )}

        <p className="text-muted-foreground">{t(`rules.${rule.id}.description`)}</p>

        {rule.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {rule.incorrectCode && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-destructive">
            {t('code.incorrect')}
            {rule.incorrectDescription && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({rule.incorrectDescription})
              </span>
            )}
          </h2>
          <CodeBlock code={rule.incorrectCode} language="tsx" />
        </div>
      )}

      {rule.correctCode && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">
            {t('code.correct')}
            {rule.correctDescription && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({rule.correctDescription})
              </span>
            )}
          </h2>
          <CodeBlock code={rule.correctCode} language="tsx" />
        </div>
      )}

      {rule.reference && (
        <div className="pt-4 border-t">
          <a
            href={rule.reference}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Reference →
          </a>
        </div>
      )}
    </div>
  )
}
