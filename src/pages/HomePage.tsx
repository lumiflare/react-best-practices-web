import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImpactBadge } from '@/components/features/rule/ImpactBadge'
import { categories } from '@/data'

export function HomePage() {
  const { t } = useTranslation()
  const { lang } = useParams()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('site.title')}</h1>
        <p className="text-muted-foreground">{t('site.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Link key={category.id} to={`/${lang}/${category.id}`}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t(`categories.${category.id}.title`)}</CardTitle>
                  <ImpactBadge impact={category.impact} />
                </div>
                <CardDescription>{t(`categories.${category.id}.description`)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.rules.length} rules
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
