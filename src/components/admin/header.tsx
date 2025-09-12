'use client'

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
// import { useUser, useClerk } from '@clerk/nextjs' // TODO: Replace with Lucia auth
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  // const { user, isLoaded } = useUser()
  // const { signOut } = useClerk()
  // TODO: Replace with Lucia auth
  const user = null
  const isLoaded = true
  const signOut = async () => {}
  const router = useRouter()

  const handleLogout = async () => {
    await signOut() // TODO: Implement with Lucia auth
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
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button className="md:hidden" size="icon" variant="ghost">
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
                <AvatarImage alt={user?.fullName || 'Admin'} src={user?.imageUrl || undefined} />
                <AvatarFallback>
                  {getInitials(user?.fullName, user?.primaryEmailAddress?.emailAddress)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent forceMount align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
                </p>
                {user?.publicMetadata?.role === 'ADMIN' && (
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