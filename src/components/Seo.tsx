import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categories } from '@/data'
import { supportedLanguages, defaultLanguage } from '@/i18n/config'

const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  const selector = `meta[${attrName}="${attrValue}"]`
  let element = document.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

const setLinkTag = (rel: string, href: string, attrs: Record<string, string> = {}) => {
  let selector = `link[rel="${rel}"]`
  if (attrs.hreflang) {
    selector += `[hreflang="${attrs.hreflang}"]`
  }
  let element = document.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
}

export function Seo() {
  const { t, i18n } = useTranslation()
  const { lang, category, rule } = useParams()
  const location = useLocation()

  useEffect(() => {
    const siteTitle = t('site.title')
    const siteDescription = t('site.description')
    let pageTitle = siteTitle
    let pageDescription = siteDescription

    if (category) {
      const categoryTitle = t(`categories.${category}.title`, { defaultValue: category })
      const categoryDescription = t(`categories.${category}.description`, {
        defaultValue: siteDescription,
      })
      pageTitle = `${categoryTitle} · ${siteTitle}`
      pageDescription = categoryDescription
    }

    if (category && rule) {
      const categoryData = categories.find((item) => item.id === category)
      const ruleData = categoryData?.rules.find((item) => item.id === rule)
      const ruleTitle = ruleData?.title ?? rule
      pageTitle = `${ruleTitle} · ${siteTitle}`
      pageDescription = t(`rules.${rule}.description`, { defaultValue: siteDescription })
    }

    document.title = pageTitle
    setMetaTag('name', 'description', pageDescription)
    setMetaTag('name', 'robots', 'index, follow')
    setMetaTag('property', 'og:title', pageTitle)
    setMetaTag('property', 'og:description', pageDescription)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:site_name', siteTitle)
    setMetaTag('name', 'twitter:card', 'summary')
    setMetaTag('name', 'twitter:title', pageTitle)
    setMetaTag('name', 'twitter:description', pageDescription)

    const canonicalUrl = `${window.location.origin}${location.pathname}`
    setMetaTag('property', 'og:url', canonicalUrl)
    setLinkTag('canonical', canonicalUrl)

    const currentLang = lang ?? i18n.language ?? defaultLanguage
    document.documentElement.lang = currentLang

    const langPrefix = `/${currentLang}`
    const pathWithoutLang = location.pathname.startsWith(langPrefix)
      ? location.pathname.slice(langPrefix.length)
      : location.pathname
    const normalizedPath = pathWithoutLang
      ? pathWithoutLang.startsWith('/')
        ? pathWithoutLang
        : `/${pathWithoutLang}`
      : ''

    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((element) => element.remove())

    supportedLanguages.forEach((language) => {
      const href = `${window.location.origin}/${language.code}${normalizedPath}`
      setLinkTag('alternate', href, { hreflang: language.code })
    })
    const defaultHref = `${window.location.origin}/${defaultLanguage}${normalizedPath}`
    setLinkTag('alternate', defaultHref, { hreflang: 'x-default' })
  }, [category, i18n.language, lang, location.pathname, rule, t])

  return null
}
