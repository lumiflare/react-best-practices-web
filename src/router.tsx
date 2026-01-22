import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { CategoryPage } from '@/pages/CategoryPage'
import { RulePage } from '@/pages/RulePage'
import { supportedLanguages, defaultLanguage } from '@/i18n/config'

const supportedLangCodes: string[] = supportedLanguages.map((lang) => lang.code)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={`/${defaultLanguage}`} replace />,
  },
  {
    path: '/:lang',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ':category',
        element: <CategoryPage />,
      },
      {
        path: ':category/:rule',
        element: <RulePage />,
      },
    ],
    loader: ({ params }) => {
      const { lang } = params
      if (lang && !supportedLangCodes.includes(lang)) {
        throw new Response('Not Found', { status: 404 })
      }
      return null
    },
  },
])
