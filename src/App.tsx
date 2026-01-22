import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './hooks/ThemeProvider'
import { SidebarProvider } from './hooks/SidebarProvider'

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
