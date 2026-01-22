import { useTranslation } from 'react-i18next'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryById } from '@/data'
import { ImpactBadge } from '@/components/features/rule/ImpactBadge'

export function CategoryPage() {
  const { t } = useTranslation()
  const { lang, category: categoryId } = useParams()

  const category = getCategoryById(categoryId || '')

  if (!category) {
    return <Navigate to={`/${lang}`} replace />
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {t(`categories.${category.id}.title`)}
          </h1>
          <ImpactBadge impact={category.impact} />
        </div>
        <p className="text-muted-foreground">{t(`categories.${category.id}.description`)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {category.rules.map((rule) => (
          <Link key={rule.id} to={`/${lang}/${category.id}/${rule.id}`}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{rule.title}</CardTitle>
                  <ImpactBadge impact={rule.impact} />
                </div>
                <CardDescription className="line-clamp-2">
                  {t(`rules.${rule.id}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
