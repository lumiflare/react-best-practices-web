import type { Category, Rule } from '@/types/rule'

export const categories: Category[] = [
  {
    id: 'async',
    impact: 'CRITICAL',
    rules: [
      {
        id: 'async-parallel',
        title: 'Promise.all() for Independent Operations',
        impact: 'CRITICAL',
        impactDescription: '2-10× improvement',
        tags: ['async', 'parallelization', 'promises', 'waterfalls'],
        incorrectCode: `const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()`,
        incorrectDescription: 'sequential execution, 3 round trips',
        correctCode: `const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])`,
        correctDescription: 'parallel execution, 1 round trip',
      },
      {
        id: 'async-dependencies',
        title: 'Dependency-Based Parallelization',
        impact: 'CRITICAL',
        impactDescription: '2-10× improvement',
        tags: ['async', 'parallelization', 'dependencies', 'better-all'],
        incorrectCode: `const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)`,
        incorrectDescription: 'profile waits for config unnecessarily',
        correctCode: `import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})`,
        correctDescription: 'config and profile run in parallel',
        reference: 'https://github.com/shuding/better-all',
      },
      {
        id: 'async-api-routes',
        title: 'Prevent Waterfall Chains in API Routes',
        impact: 'CRITICAL',
        impactDescription: '2-10× improvement',
        tags: ['api-routes', 'server-actions', 'waterfalls', 'parallelization'],
        incorrectCode: `export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}`,
        incorrectDescription: 'config waits for auth, data waits for both',
        correctCode: `export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}`,
        correctDescription: 'auth and config start immediately',
      },
      {
        id: 'async-suspense-boundaries',
        title: 'Strategic Suspense Boundaries',
        impact: 'HIGH',
        impactDescription: 'faster initial paint',
        tags: ['async', 'suspense', 'streaming', 'layout-shift'],
        incorrectCode: `async function Page() {
  const data = await fetchData() // Blocks entire page

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}`,
        incorrectDescription: 'wrapper blocked by data fetching',
        correctCode: `function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Only blocks this component
  return <div>{data.content}</div>
}`,
        correctDescription: 'wrapper shows immediately, data streams in',
      },
      {
        id: 'async-defer-await',
        title: 'Defer Await Until Needed',
        impact: 'HIGH',
        impactDescription: 'avoids blocking unused code paths',
        tags: ['async', 'await', 'conditional', 'optimization'],
        incorrectCode: `async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // Returns immediately but still waited for userData
    return { skipped: true }
  }

  // Only this branch uses userData
  return processUserData(userData)
}`,
        incorrectDescription: 'blocks both branches',
        correctCode: `async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Returns immediately without waiting
    return { skipped: true }
  }

  // Fetch only when needed
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}`,
        correctDescription: 'only blocks when needed',
      },
    ],
  },
  {
    id: 'bundle',
    impact: 'CRITICAL',
    rules: [
      {
        id: 'bundle-barrel-imports',
        title: 'Avoid Barrel File Imports',
        impact: 'CRITICAL',
        impactDescription: '200-800ms import cost, slow builds',
        tags: ['bundle', 'imports', 'tree-shaking', 'barrel-files', 'performance'],
        incorrectCode: `import { Check, X, Menu } from 'lucide-react'
// Loads 1,583 modules, takes ~2.8s extra in dev

import { Button, TextField } from '@mui/material'
// Loads 2,225 modules, takes ~4.2s extra in dev`,
        incorrectDescription: 'imports entire library',
        correctCode: `import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Loads only 3 modules (~2KB vs ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Loads only what you use`,
        correctDescription: 'imports only what you need',
        reference: 'https://vercel.com/blog/how-we-optimized-package-imports-in-next-js',
      },
      {
        id: 'bundle-dynamic-imports',
        title: 'Dynamic Imports for Heavy Components',
        impact: 'CRITICAL',
        impactDescription: 'directly affects TTI and LCP',
        tags: ['bundle', 'dynamic-import', 'code-splitting', 'next-dynamic'],
        incorrectCode: `import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}`,
        incorrectDescription: 'Monaco bundles with main chunk ~300KB',
        correctCode: `import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}`,
        correctDescription: 'Monaco loads on demand',
      },
      {
        id: 'bundle-conditional',
        title: 'Conditional Module Loading',
        impact: 'HIGH',
        impactDescription: 'loads large data only when needed',
        tags: ['bundle', 'conditional-loading', 'lazy-loading'],
        correctCode: `function AnimationPlayer({ enabled, setEnabled }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}`,
        correctDescription: 'lazy-load animation frames',
      },
      {
        id: 'bundle-defer-third-party',
        title: 'Defer Non-Critical Third-Party Libraries',
        impact: 'MEDIUM',
        impactDescription: 'loads after hydration',
        tags: ['bundle', 'third-party', 'analytics', 'defer'],
        incorrectCode: `import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}`,
        incorrectDescription: 'blocks initial bundle',
        correctCode: `import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}`,
        correctDescription: 'loads after hydration',
      },
      {
        id: 'bundle-preload',
        title: 'Preload Based on User Intent',
        impact: 'MEDIUM',
        impactDescription: 'reduces perceived latency',
        tags: ['bundle', 'preload', 'user-intent', 'hover'],
        correctCode: `function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}`,
        correctDescription: 'preload on hover/focus',
      },
    ],
  },
  {
    id: 'server',
    impact: 'HIGH',
    rules: [
      {
        id: 'server-auth-actions',
        title: 'Authenticate Server Actions Like API Routes',
        impact: 'CRITICAL',
        impactDescription: 'prevents unauthorized access to server mutations',
        tags: ['server', 'server-actions', 'authentication', 'security', 'authorization'],
        incorrectCode: `'use server'

export async function deleteUser(userId: string) {
  // Anyone can call this! No auth check
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}`,
        incorrectDescription: 'no authentication check',
        correctCode: `'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // Always check auth inside the action
  const session = await verifySession()

  if (!session) {
    throw unauthorized('Must be logged in')
  }

  // Check authorization too
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('Cannot delete other users')
  }

  await db.user.delete({ where: { id: userId } })
  return { success: true }
}`,
        correctDescription: 'authentication inside the action',
        reference: 'https://nextjs.org/docs/app/guides/authentication',
      },
      {
        id: 'server-parallel-fetching',
        title: 'Parallel Data Fetching with Component Composition',
        impact: 'CRITICAL',
        impactDescription: 'eliminates server-side waterfalls',
        tags: ['server', 'rsc', 'parallel-fetching', 'composition'],
        incorrectCode: `export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}`,
        incorrectDescription: 'Sidebar waits for Page fetch to complete',
        correctCode: `async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}`,
        correctDescription: 'both fetch simultaneously',
      },
      {
        id: 'server-serialization',
        title: 'Minimize Serialization at RSC Boundaries',
        impact: 'HIGH',
        impactDescription: 'reduces data transfer size',
        tags: ['server', 'rsc', 'serialization', 'props'],
        incorrectCode: `async function Page() {
  const user = await fetchUser()  // 50 fields
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // uses 1 field
}`,
        incorrectDescription: 'serializes all 50 fields',
        correctCode: `async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}`,
        correctDescription: 'serializes only 1 field',
      },
      {
        id: 'server-cache-lru',
        title: 'Cross-Request LRU Caching',
        impact: 'HIGH',
        impactDescription: 'caches across requests',
        tags: ['server', 'cache', 'lru', 'cross-request'],
        correctCode: `import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5 minutes
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// Request 1: DB query, result cached
// Request 2: cache hit, no DB query`,
        reference: 'https://github.com/isaacs/node-lru-cache',
      },
      {
        id: 'server-cache-react',
        title: 'Per-Request Deduplication with React.cache()',
        impact: 'MEDIUM',
        impactDescription: 'deduplicates within request',
        tags: ['server', 'cache', 'react-cache', 'deduplication'],
        incorrectCode: `const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// Each call creates new object, never hits cache
getUser({ uid: 1 })
getUser({ uid: 1 })  // Cache miss, runs query again`,
        incorrectDescription: 'always cache miss',
        correctCode: `import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})

// Primitive args use value equality
getUser(1)
getUser(1)  // Cache hit, returns cached result`,
        correctDescription: 'cache hit',
        reference: 'https://react.dev/reference/react/cache',
      },
      {
        id: 'server-after-nonblocking',
        title: 'Use after() for Non-Blocking Operations',
        impact: 'MEDIUM',
        impactDescription: 'faster response times',
        tags: ['server', 'async', 'logging', 'analytics', 'side-effects'],
        incorrectCode: `export async function POST(request: Request) {
  await updateDatabase(request)

  // Logging blocks the response
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })

  return new Response(JSON.stringify({ status: 'success' }))
}`,
        incorrectDescription: 'blocks response',
        correctCode: `import { after } from 'next/server'
import { headers, cookies } from 'next/headers'

export async function POST(request: Request) {
  await updateDatabase(request)

  // Log after response is sent
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'

    logUserAction({ sessionCookie, userAgent })
  })

  return new Response(JSON.stringify({ status: 'success' }))
}`,
        correctDescription: 'non-blocking',
        reference: 'https://nextjs.org/docs/app/api-reference/functions/after',
      },
      {
        id: 'server-dedup-props',
        title: 'Avoid Duplicate Serialization in RSC Props',
        impact: 'LOW',
        impactDescription: 'reduces network payload',
        tags: ['server', 'rsc', 'serialization', 'props', 'client-components'],
        incorrectCode: `// RSC: sends 6 strings (2 arrays × 3 items)
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />`,
        incorrectDescription: 'duplicates array',
        correctCode: `// RSC: send once
<ClientList usernames={usernames} />

// Client: transform there
'use client'
const sorted = useMemo(() => [...usernames].sort(), [usernames])`,
        correctDescription: 'sends 3 strings',
      },
    ],
  },
  {
    id: 'client',
    impact: 'MEDIUM',
    rules: [
      {
        id: 'client-swr-dedup',
        title: 'Use SWR for Automatic Deduplication',
        impact: 'MEDIUM-HIGH',
        impactDescription: 'automatic deduplication',
        tags: ['client', 'swr', 'deduplication', 'data-fetching'],
        incorrectCode: `function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
  }, [])
}`,
        incorrectDescription: 'no deduplication, each instance fetches',
        correctCode: `import useSWR from 'swr'

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}`,
        correctDescription: 'multiple instances share one request',
        reference: 'https://swr.vercel.app',
      },
      {
        id: 'client-localstorage-schema',
        title: 'Version and Minimize localStorage Data',
        impact: 'MEDIUM',
        impactDescription: 'prevents schema conflicts, reduces storage size',
        tags: ['client', 'localStorage', 'storage', 'versioning', 'data-minimization'],
        incorrectCode: `// No version, stores everything, no error handling
localStorage.setItem('userConfig', JSON.stringify(fullUserObject))
const data = localStorage.getItem('userConfig')`,
        correctCode: `const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(\`userConfig:\${VERSION}\`, JSON.stringify(config))
  } catch {
    // Throws in incognito/private browsing, quota exceeded, or disabled
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(\`userConfig:\${VERSION}\`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}`,
      },
      {
        id: 'client-passive-event-listeners',
        title: 'Use Passive Event Listeners for Scrolling Performance',
        impact: 'MEDIUM',
        impactDescription: 'eliminates scroll delay caused by event listeners',
        tags: ['client', 'event-listeners', 'scrolling', 'performance', 'touch', 'wheel'],
        incorrectCode: `useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)

  document.addEventListener('touchstart', handleTouch)
  document.addEventListener('wheel', handleWheel)

  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])`,
        correctCode: `useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)

  document.addEventListener('touchstart', handleTouch, { passive: true })
  document.addEventListener('wheel', handleWheel, { passive: true })

  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])`,
      },
      {
        id: 'client-event-listeners',
        title: 'Deduplicate Global Event Listeners',
        impact: 'LOW',
        impactDescription: 'single listener for N components',
        tags: ['client', 'swr', 'event-listeners', 'subscription'],
        incorrectCode: `function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}`,
        incorrectDescription: 'N instances = N listeners',
        correctCode: `import useSWRSubscription from 'swr/subscription'

const keyCallbacks = new Map<string, Set<() => void>>()

function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    if (!keyCallbacks.has(key)) {
      keyCallbacks.set(key, new Set())
    }
    keyCallbacks.get(key)!.add(callback)

    return () => {
      const set = keyCallbacks.get(key)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          keyCallbacks.delete(key)
        }
      }
    }
  }, [key, callback])

  useSWRSubscription('global-keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) {
        keyCallbacks.get(e.key)!.forEach(cb => cb())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}`,
        correctDescription: 'N instances = 1 listener',
      },
    ],
  },
  {
    id: 'rerender',
    impact: 'MEDIUM',
    rules: [
      {
        id: 'rerender-functional-setstate',
        title: 'Use Functional setState Updates',
        impact: 'MEDIUM',
        impactDescription: 'prevents stale closures and unnecessary callback recreations',
        tags: ['react', 'hooks', 'useState', 'useCallback', 'callbacks', 'closures'],
        incorrectCode: `function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])  // ❌ items dependency causes recreations
}`,
        incorrectDescription: 'requires state as dependency',
        correctCode: `function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems(curr => [...curr, ...newItems])
  }, [])  // ✅ No dependencies needed
}`,
        correctDescription: 'stable callbacks, no stale closures',
      },
      {
        id: 'rerender-lazy-state-init',
        title: 'Use Lazy State Initialization',
        impact: 'MEDIUM',
        impactDescription: 'wasted computation on every render',
        tags: ['react', 'hooks', 'useState', 'performance', 'initialization'],
        incorrectCode: `function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs on EVERY render
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
}`,
        incorrectDescription: 'runs on every render',
        correctCode: `function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs ONLY on initial render
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
}`,
        correctDescription: 'runs only once',
      },
      {
        id: 'rerender-memo',
        title: 'Extract to Memoized Components',
        impact: 'MEDIUM',
        impactDescription: 'enables early returns',
        tags: ['rerender', 'memo', 'useMemo', 'optimization'],
        incorrectCode: `function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}`,
        incorrectDescription: 'computes avatar even when loading',
        correctCode: `const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}`,
        correctDescription: 'skips computation when loading',
      },
      {
        id: 'rerender-memo-with-default-value',
        title: 'Extract Default Non-primitive Parameter Value to Constant',
        impact: 'MEDIUM',
        impactDescription: 'restores memoization by using a constant for default value',
        tags: ['rerender', 'memo', 'optimization'],
        incorrectCode: `const UserAvatar = memo(function UserAvatar({ onClick = () => {} }) {
  // ...
})

// Used without optional onClick
<UserAvatar />`,
        incorrectDescription: 'onClick has different values on every rerender',
        correctCode: `const NOOP = () => {};

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }) {
  // ...
})

// Used without optional onClick
<UserAvatar />`,
        correctDescription: 'stable default value',
      },
      {
        id: 'rerender-derived-state',
        title: 'Subscribe to Derived State',
        impact: 'MEDIUM',
        impactDescription: 'reduces re-render frequency',
        tags: ['rerender', 'derived-state', 'media-query', 'optimization'],
        incorrectCode: `function Sidebar() {
  const width = useWindowWidth()  // updates continuously
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}`,
        incorrectDescription: 're-renders on every pixel change',
        correctCode: `function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}`,
        correctDescription: 're-renders only when boolean changes',
      },
      {
        id: 'rerender-defer-reads',
        title: 'Defer State Reads to Usage Point',
        impact: 'MEDIUM',
        impactDescription: 'avoids unnecessary subscriptions',
        tags: ['rerender', 'searchParams', 'localStorage', 'optimization'],
        incorrectCode: `function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}`,
        incorrectDescription: 'subscribes to all searchParams changes',
        correctCode: `function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}`,
        correctDescription: 'reads on demand, no subscription',
      },
      {
        id: 'rerender-transitions',
        title: 'Use Transitions for Non-Urgent Updates',
        impact: 'MEDIUM',
        impactDescription: 'maintains UI responsiveness',
        tags: ['rerender', 'transitions', 'startTransition', 'performance'],
        incorrectCode: `function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}`,
        incorrectDescription: 'blocks UI on every scroll',
        correctCode: `import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}`,
        correctDescription: 'non-blocking updates',
      },
      {
        id: 'rerender-dependencies',
        title: 'Narrow Effect Dependencies',
        impact: 'LOW',
        impactDescription: 'minimizes effect re-runs',
        tags: ['rerender', 'useEffect', 'dependencies', 'optimization'],
        incorrectCode: `useEffect(() => {
  console.log(user.id)
}, [user])`,
        incorrectDescription: 're-runs on any user field change',
        correctCode: `useEffect(() => {
  console.log(user.id)
}, [user.id])`,
        correctDescription: 're-runs only when id changes',
      },
      {
        id: 'rerender-simple-expression-in-memo',
        title: 'Do not wrap simple expressions in useMemo',
        impact: 'LOW-MEDIUM',
        impactDescription: 'wasted computation on every render',
        tags: ['rerender', 'useMemo', 'optimization'],
        incorrectCode: `function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
}`,
        correctCode: `function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
}`,
      },
    ],
  },
  {
    id: 'rendering',
    impact: 'MEDIUM',
    rules: [
      {
        id: 'rendering-content-visibility',
        title: 'CSS content-visibility for Long Lists',
        impact: 'HIGH',
        impactDescription: 'faster initial render',
        tags: ['rendering', 'css', 'content-visibility', 'long-lists'],
        correctCode: `.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}`,
      },
      {
        id: 'rendering-hydration-no-flicker',
        title: 'Prevent Hydration Mismatch Without Flickering',
        impact: 'MEDIUM',
        impactDescription: 'avoids visual flicker and hydration errors',
        tags: ['rendering', 'ssr', 'hydration', 'localStorage', 'flicker'],
        incorrectCode: `function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    }
  }, [])

  return (
    <div className={theme}>
      {children}
    </div>
  )
}`,
        incorrectDescription: 'visual flickering',
        correctCode: `function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">
        {children}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: \`
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          \`,
        }}
      />
    </>
  )
}`,
        correctDescription: 'no flicker, no hydration mismatch',
      },
      {
        id: 'rendering-activity',
        title: 'Use Activity Component for Show/Hide',
        impact: 'MEDIUM',
        impactDescription: 'preserves state/DOM',
        tags: ['rendering', 'activity', 'visibility', 'state-preservation'],
        correctCode: `import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}`,
      },
      {
        id: 'rendering-hoist-jsx',
        title: 'Hoist Static JSX Elements',
        impact: 'LOW',
        impactDescription: 'avoids re-creation',
        tags: ['rendering', 'jsx', 'static', 'optimization'],
        incorrectCode: `function LoadingSkeleton() {
  return <div className="animate-pulse h-20 bg-gray-200" />
}

function Container() {
  return (
    <div>
      {loading && <LoadingSkeleton />}
    </div>
  )
}`,
        incorrectDescription: 'recreates element every render',
        correctCode: `const loadingSkeleton = (
  <div className="animate-pulse h-20 bg-gray-200" />
)

function Container() {
  return (
    <div>
      {loading && loadingSkeleton}
    </div>
  )
}`,
        correctDescription: 'reuses same element',
      },
      {
        id: 'rendering-conditional-render',
        title: 'Use Explicit Conditional Rendering',
        impact: 'LOW',
        impactDescription: 'prevents rendering 0 or NaN',
        tags: ['rendering', 'conditional', 'jsx', 'falsy-values'],
        incorrectCode: `function Badge({ count }: { count: number }) {
  return (
    <div>
      {count && <span className="badge">{count}</span>}
    </div>
  )
}
// When count = 0, renders: <div>0</div>`,
        incorrectDescription: 'renders "0" when count is 0',
        correctCode: `function Badge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </div>
  )
}
// When count = 0, renders: <div></div>`,
        correctDescription: 'renders nothing when count is 0',
      },
      {
        id: 'rendering-animate-svg-wrapper',
        title: 'Animate SVG Wrapper Instead of SVG Element',
        impact: 'LOW',
        impactDescription: 'enables hardware acceleration',
        tags: ['rendering', 'svg', 'css', 'animation', 'performance'],
        incorrectCode: `function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
    </svg>
  )
}`,
        incorrectDescription: 'animating SVG directly - no hardware acceleration',
        correctCode: `function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    </div>
  )
}`,
        correctDescription: 'animating wrapper div - hardware accelerated',
      },
      {
        id: 'rendering-svg-precision',
        title: 'Optimize SVG Precision',
        impact: 'LOW',
        impactDescription: 'reduces file size',
        tags: ['rendering', 'svg', 'optimization', 'svgo'],
        incorrectCode: `<path d="M 10.293847 20.847362 L 30.938472 40.192837" />`,
        incorrectDescription: 'excessive precision',
        correctCode: `<path d="M 10.3 20.8 L 30.9 40.2" />`,
        correctDescription: '1 decimal place',
      },
    ],
  },
  {
    id: 'js',
    impact: 'LOW',
    rules: [
      {
        id: 'js-length-check-first',
        title: 'Early Length Check for Array Comparisons',
        impact: 'MEDIUM-HIGH',
        impactDescription: 'avoids expensive operations when lengths differ',
        tags: ['javascript', 'arrays', 'performance', 'optimization', 'comparison'],
        incorrectCode: `function hasChanges(current: string[], original: string[]) {
  return current.sort().join() !== original.sort().join()
}`,
        incorrectDescription: 'always runs expensive comparison',
        correctCode: `function hasChanges(current: string[], original: string[]) {
  if (current.length !== original.length) {
    return true
  }
  const currentSorted = current.toSorted()
  const originalSorted = original.toSorted()
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) {
      return true
    }
  }
  return false
}`,
        correctDescription: 'O(1) length check first',
      },
      {
        id: 'js-tosorted-immutable',
        title: 'Use toSorted() Instead of sort() for Immutability',
        impact: 'MEDIUM-HIGH',
        impactDescription: 'prevents mutation bugs in React state',
        tags: ['javascript', 'arrays', 'immutability', 'react', 'state', 'mutation'],
        incorrectCode: `function UserList({ users }: { users: User[] }) {
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}`,
        incorrectDescription: 'mutates original array',
        correctCode: `function UserList({ users }: { users: User[] }) {
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}`,
        correctDescription: 'creates new array',
      },
      {
        id: 'js-batch-dom-css',
        title: 'Avoid Layout Thrashing',
        impact: 'MEDIUM',
        impactDescription: 'prevents forced synchronous layouts',
        tags: ['javascript', 'dom', 'css', 'performance', 'reflow', 'layout-thrashing'],
        incorrectCode: `function layoutThrashing(element: HTMLElement) {
  element.style.width = '100px'
  const width = element.offsetWidth  // Forces reflow
  element.style.height = '200px'
  const height = element.offsetHeight  // Forces another reflow
}`,
        incorrectDescription: 'interleaved reads and writes force reflows',
        correctCode: `function avoidThrashing(element: HTMLElement) {
  // Read phase - all layout queries first
  const rect1 = element.getBoundingClientRect()
  const offsetWidth = element.offsetWidth

  // Write phase - all style changes after
  element.style.width = '100px'
  element.style.height = '200px'
}`,
        correctDescription: 'batch reads, then writes',
      },
      {
        id: 'js-cache-function-results',
        title: 'Cache Repeated Function Calls',
        impact: 'MEDIUM',
        impactDescription: 'avoid redundant computation',
        tags: ['javascript', 'cache', 'memoization', 'performance'],
        incorrectCode: `function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify() called 100+ times for same project names
        const slug = slugify(project.name)
        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}`,
        incorrectDescription: 'redundant computation',
        correctCode: `const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}`,
        correctDescription: 'cached results',
        reference: 'https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast',
      },
      {
        id: 'js-index-maps',
        title: 'Build Index Maps for Repeated Lookups',
        impact: 'LOW-MEDIUM',
        impactDescription: '1M ops to 2K ops',
        tags: ['javascript', 'map', 'indexing', 'optimization', 'performance'],
        incorrectCode: `function processOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId)
  }))
}`,
        incorrectDescription: 'O(n) per lookup',
        correctCode: `function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map(u => [u.id, u]))

  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId)
  }))
}`,
        correctDescription: 'O(1) per lookup',
      },
      {
        id: 'js-set-map-lookups',
        title: 'Use Set/Map for O(1) Lookups',
        impact: 'LOW-MEDIUM',
        impactDescription: 'O(n) to O(1)',
        tags: ['javascript', 'set', 'map', 'data-structures', 'performance'],
        incorrectCode: `const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))`,
        incorrectDescription: 'O(n) per check',
        correctCode: `const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))`,
        correctDescription: 'O(1) per check',
      },
      {
        id: 'js-combine-iterations',
        title: 'Combine Multiple Array Iterations',
        impact: 'LOW-MEDIUM',
        impactDescription: 'reduces iterations',
        tags: ['javascript', 'arrays', 'loops', 'performance'],
        incorrectCode: `const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)
const inactive = users.filter(u => !u.isActive)`,
        incorrectDescription: '3 iterations',
        correctCode: `const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}`,
        correctDescription: '1 iteration',
      },
      {
        id: 'js-early-exit',
        title: 'Early Return from Functions',
        impact: 'LOW-MEDIUM',
        impactDescription: 'avoids unnecessary computation',
        tags: ['javascript', 'functions', 'optimization', 'early-return'],
        incorrectCode: `function validateUsers(users: User[]) {
  let hasError = false
  let errorMessage = ''

  for (const user of users) {
    if (!user.email) {
      hasError = true
      errorMessage = 'Email required'
    }
    // Continues checking all users even after error found
  }

  return hasError ? { valid: false, error: errorMessage } : { valid: true }
}`,
        incorrectDescription: 'processes all items even after finding answer',
        correctCode: `function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: 'Email required' }
    }
    if (!user.name) {
      return { valid: false, error: 'Name required' }
    }
  }

  return { valid: true }
}`,
        correctDescription: 'returns immediately on first error',
      },
      {
        id: 'js-hoist-regexp',
        title: 'Hoist RegExp Creation',
        impact: 'LOW-MEDIUM',
        impactDescription: 'avoids recreation',
        tags: ['javascript', 'regexp', 'optimization', 'memoization'],
        incorrectCode: `function Highlighter({ text, query }: Props) {
  const regex = new RegExp(\`(\${query})\`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}`,
        incorrectDescription: 'new RegExp every render',
        correctCode: `const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(\`(\${escapeRegex(query)})\`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}`,
        correctDescription: 'memoize or hoist',
      },
      {
        id: 'js-cache-property-access',
        title: 'Cache Property Access in Loops',
        impact: 'LOW-MEDIUM',
        impactDescription: 'reduces lookups',
        tags: ['javascript', 'loops', 'optimization', 'caching'],
        incorrectCode: `for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}`,
        incorrectDescription: '3 lookups × N iterations',
        correctCode: `const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}`,
        correctDescription: '1 lookup total',
      },
      {
        id: 'js-cache-storage',
        title: 'Cache Storage API Calls',
        impact: 'LOW-MEDIUM',
        impactDescription: 'reduces expensive I/O',
        tags: ['javascript', 'localStorage', 'storage', 'caching', 'performance'],
        incorrectCode: `function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}
// Called 10 times = 10 storage reads`,
        incorrectDescription: 'reads storage on every call',
        correctCode: `const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value)
}`,
        correctDescription: 'Map cache',
      },
      {
        id: 'js-min-max-loop',
        title: 'Use Loop for Min/Max Instead of Sort',
        impact: 'LOW',
        impactDescription: 'O(n) instead of O(n log n)',
        tags: ['javascript', 'arrays', 'performance', 'sorting', 'algorithms'],
        incorrectCode: `function getLatestProject(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
  return sorted[0]
}`,
        incorrectDescription: 'O(n log n) - sort to find latest',
        correctCode: `function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null

  let latest = projects[0]

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }

  return latest
}`,
        correctDescription: 'O(n) - single loop',
      },
    ],
  },
  {
    id: 'advanced',
    impact: 'LOW',
    rules: [
      {
        id: 'advanced-event-handler-refs',
        title: 'Store Event Handlers in Refs',
        impact: 'LOW',
        impactDescription: 'stable subscriptions',
        tags: ['advanced', 'hooks', 'refs', 'event-handlers', 'optimization'],
        incorrectCode: `function useWindowEvent(event: string, handler: (e) => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}`,
        incorrectDescription: 're-subscribes on every render',
        correctCode: `function useWindowEvent(event: string, handler: (e) => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (e) => handlerRef.current(e)
    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}`,
        correctDescription: 'stable subscription',
      },
      {
        id: 'advanced-use-latest',
        title: 'useEffectEvent for Stable Callback Refs',
        impact: 'LOW',
        impactDescription: 'prevents effect re-runs',
        tags: ['advanced', 'hooks', 'useEffectEvent', 'refs', 'optimization'],
        incorrectCode: `function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])
}`,
        incorrectDescription: 'effect re-runs on every callback change',
        correctCode: `import { useEffectEvent } from 'react';

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}`,
        correctDescription: 'using React useEffectEvent',
      },
    ],
  },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id)
}

export function getRuleById(categoryId: string, ruleId: string): Rule | undefined {
  const category = getCategoryById(categoryId)
  return category?.rules.find((rule) => rule.id === ruleId)
}
