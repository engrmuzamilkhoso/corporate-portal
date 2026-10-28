'use client'

import Script from 'next/script'

import { Provider } from 'react-redux'
import store from './../store'
import './../styles/style.scss'
// We use those styles to show code examples, you should remove them in your application.
import Loader from '@/components/loader'
import { Poppins } from 'next/font/google'
import { Suspense } from 'react'
import { AuthProvider } from './../AuthContext'
import './../styles/examples.scss'
import ErrorBoundary from './ErrorBoundary'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${poppins.variable}`} lang="en">
      <head>
        <title>SIMPAISA - CORPORATE PORTAL </title>
        <link
          rel="icon"
          type="image/x-icon"
          href="https://www.simpoysha.com/assets/images/favicon.svg"
        />
        <Script
          id="get-color-scheme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
        const userMode = localStorage.getItem('coreui-pro-next-js-admin-template-theme-default');
        const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (userMode === 'dark' || (userMode !== 'light' && systemDarkMode)) {
          document.documentElement.dataset.coreuiTheme = 'light';
        }`,
          }}
        />
      </head>
      <body>
        <Provider store={store}>
          <AuthProvider>
            <Suspense fallback={<Loader isLoading={false} />}>
              <ErrorBoundary>
                <AuthProtected>{children}</AuthProtected>
              </ErrorBoundary>
            </Suspense>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
function AuthProtected({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
