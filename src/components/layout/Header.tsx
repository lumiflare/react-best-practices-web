import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Menu, Moon, Sun, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/hooks/useSidebar'
import { useTheme } from '@/hooks/useTheme'
import { supportedLanguages } from '@/i18n/config'

export function Header() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { toggle } = useSidebar()
  const { theme, setTheme } = useTheme()

  const handleLanguageChange = (newLang: string) => {
    if (!lang) {
      return
    }
    const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`)
    navigate({ pathname: newPath, search: location.search, hash: location.hash }, { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={toggle}
          aria-label={t('nav.toggleSidebar')}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('nav.selectLanguage')}>
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {supportedLanguages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={i18n.language === language.code ? 'bg-accent' : ''}
                >
                  <span className="mr-2">{language.flag}</span>
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('nav.toggleTheme')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
