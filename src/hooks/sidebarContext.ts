import { createContext } from 'react'

export interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined)
