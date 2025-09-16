'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, User, Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onToggleDesktopSidebar?: () => void
  onToggleMobileSidebar?: () => void
}

export function AdminHeader({ onToggleDesktopSidebar, onToggleMobileSidebar }: AdminHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        } else {
          setUser(null)
          // Redirect non-authenticated users
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        router.push('/auth/signin')
      } finally {
        setIsLoaded(true)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (response.ok) {
        setUser(null)
        router.push('/auth/signin')
      } else {
        console.error('Failed to sign out')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Get user initials for avatar
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'AD'
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Mobile sidebar toggle - only show on mobile */}
      <Button
        aria-label="Toggle mobile sidebar"
        className="lg:hidden"
        size="icon"
        variant="ghost"
        onClick={onToggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search orders, customers, products..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="relative" size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="relative h-8 w-8 rounded-full" variant="ghost">
              <Avatar className="h-8 w-8">
                <AvatarImage alt={user?.name || 'Admin'} src={undefined} />
                <AvatarFallback>
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent forceMount align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'Loading...'}
                </p>
                {user?.role === 'ADMIN' && (
                  <p className="text-xs text-primary font-medium mt-1">
                    Administrator
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}