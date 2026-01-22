import { Outlet, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Seo } from '@/components/Seo'
import { useSidebar } from '@/hooks/useSidebar'
import { cn } from '@/lib/utils'

export function Layout() {
  const { lang } = useParams()
  const { i18n } = useTranslation()
  const { isOpen, isMobile } = useSidebar()

  useEffect(() => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  return (
    <div className="min-h-screen bg-background">
      <Seo />
      <Header />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            'flex-1 p-6 transition-all duration-300',
            !isMobile && isOpen && 'ml-64'
          )}
        >
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
