import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/hooks/useSidebar'
import { categories } from '@/data'
import { cn } from '@/lib/utils'

function SidebarContent() {
  const { t } = useTranslation()
  const { lang, category: currentCategory } = useParams()
  const { close, isMobile } = useSidebar()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  useEffect(() => {
    setExpandedCategory(currentCategory ?? null)
  }, [currentCategory])

  const handleLinkClick = () => {
    if (isMobile) {
      close()
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          to={`/${lang}`}
          className="flex items-center gap-2 font-semibold"
          onClick={handleLinkClick}
        >
          {t('site.title')}
        </Link>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-3 py-4">
        <nav className="space-y-6">
          {categories.map((category) => {
            const isExpanded = expandedCategory === category.id
            return (
              <div key={category.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategoryClick(category.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`sidebar-category-${category.id}`}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent',
                    currentCategory === category.id && 'bg-accent'
                  )}
                >
                  <span>{t(`categories.${category.id}.title`)}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'bg-white text-xs text-black',
                      category.impact === 'CRITICAL' && 'border-red-500'
                    )}
                  >
                    {category.rules.length}
                  </Badge>
                </button>
                <div
                  id={`sidebar-category-${category.id}`}
                  className={cn(
                    'grid min-h-0 transition-[grid-template-rows,opacity] duration-300 ease-out',
                    isExpanded
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  )}
                >
                  <div className="ml-3 min-h-0 space-y-1 overflow-hidden border-l pl-3">
                    {category.rules.map((rule) => (
                      <NavLink
                        key={rule.id}
                        to={`/${lang}/${category.id}/${rule.id}`}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                            isActive && 'bg-accent text-foreground'
                          )
                        }
                        end
                      >
                        {rule.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="flex items-center gap-4 p-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { isOpen, close, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <SidebarContent />
    </aside>
  )
}
