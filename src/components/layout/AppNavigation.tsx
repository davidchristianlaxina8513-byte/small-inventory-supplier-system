'use client'

import { useState, type ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowsRightLeftIcon,
  ExclamationCircleIcon,
  BellIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

type NavItem = {
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
}

type AppNavigationProps = {
  user: {
    fullName: string
    roleSummary: string
    email?: string
    officeName?: string | null
    isAdmin: boolean
    isStaff: boolean
    canAccessInventory: boolean
  }
  children: React.ReactNode
}

export function AppNavigation({ user, children }: AppNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const pathname = usePathname()

  const mainNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ...(user.canAccessInventory ? [{ name: 'Inventory', href: '/inventory', icon: CubeIcon }] : []),
    { name: 'Requests', href: '/requests', icon: DocumentTextIcon },
    { name: 'Reservations', href: '/reservations', icon: CalendarDaysIcon },
    { name: 'Borrowings', href: '/borrowings', icon: ArrowsRightLeftIcon },
    { name: 'Incidents', href: '/incidents', icon: ExclamationCircleIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ]

  const staffNavigation: NavItem[] = user.isStaff
    ? [
        { name: 'Assets', href: '/assets', icon: BuildingOffice2Icon },
        { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
        { name: 'Purchasing', href: '/purchasing', icon: ShoppingCartIcon },
        { name: 'Reports', href: '/reports', icon: ChartBarIcon },
      ]
    : []

  const adminNavigation: NavItem[] = user.isAdmin
    ? [
        { name: 'User Management', href: '/admin/users', icon: UsersIcon },
        { name: 'Offices', href: '/admin/offices', icon: BuildingOffice2Icon },
      ]
    : []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Mobile Sidebar Inner */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-500 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-blue-400/50">
                  <div className="text-center">
                    <span className="font-bold text-white text-base block leading-tight">
                      Small Inventory &amp; Supplier System
                    </span>
                    <span className="text-[11px] font-medium text-blue-100">SISS Academic Portal</span>
                  </div>
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-6">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {mainNavigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`group flex gap-x-3 rounded-md p-2.5 text-base font-semibold ${
                                isLinkActive(item.href)
                                  ? 'bg-blue-800 text-white shadow-sm'
                                  : 'text-white hover:bg-blue-800/80 hover:text-white'
                              }`}
                            >
                              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {staffNavigation.length > 0 && (
                      <li>
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-200 px-2">
                          Operations
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {staffNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex gap-x-3 rounded-md p-2.5 text-base font-semibold ${
                                  isLinkActive(item.href)
                                    ? 'bg-blue-800 text-white shadow-sm'
                                    : 'text-white hover:bg-blue-800/80 hover:text-white'
                                }`}
                              >
                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}

                    {adminNavigation.length > 0 && (
                      <li>
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-200 px-2">
                          System Management
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {adminNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex gap-x-3 rounded-md p-2.5 text-base font-semibold ${
                                  isLinkActive(item.href)
                                    ? 'bg-blue-800 text-white shadow-sm'
                                    : 'text-white hover:bg-blue-800/80 hover:text-white'
                                }`}
                              >
                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar matching DCASIS lg:w-72 bg-blue-500 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-500 px-6 pb-4 border-r border-blue-600 shadow-md">
          {/* Header Title */}
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-blue-400/50">
            <div className="text-center">
              <span className="font-bold text-white text-base block tracking-tight">
                Small Inventory &amp; Supplier System
              </span>
              <span className="text-[11px] font-medium text-blue-100">
                {user.officeName ?? 'Three-Office Centralized Portal'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-6">
              <li>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-200 px-2 mb-2">
                  Main Navigation
                </div>
                <ul role="list" className="-mx-2 space-y-1">
                  {mainNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold transition ${
                          isLinkActive(item.href)
                            ? 'bg-blue-800 text-white shadow-sm'
                            : 'text-white hover:bg-blue-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {staffNavigation.length > 0 && (
                <li>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200 px-2 mb-2">
                    Operations
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {staffNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold transition ${
                            isLinkActive(item.href)
                              ? 'bg-blue-800 text-white shadow-sm'
                              : 'text-white hover:bg-blue-800 hover:text-white'
                          }`}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              {adminNavigation.length > 0 && (
                <li>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200 px-2 mb-2">
                    System Management
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold transition ${
                            isLinkActive(item.href)
                              ? 'bg-blue-800 text-white shadow-sm'
                              : 'text-white hover:bg-blue-800 hover:text-white'
                          }`}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </nav>

          {/* User Role Tag at bottom */}
          <div className="rounded-md bg-blue-600/70 p-3 text-xs text-white border border-blue-400/40">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-300" />
              <span className="font-semibold">{user.roleSummary}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Column */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar matching DCASIS */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-black lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
          </button>

          <div className="flex flex-1 items-center justify-between">
            {/* Title / Office Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                {user.officeName ?? 'Central Office'}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">•</span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                {user.roleSummary}
              </span>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="-m-1.5 flex items-center p-1.5 cursor-pointer rounded-md hover:bg-gray-50 focus:outline-none"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 shadow-sm">
                  <span className="text-sm font-bold leading-none text-white">
                    {getInitials(user.fullName)}
                  </span>
                </span>
                <span className="hidden md:flex md:items-center">
                  <span className="ml-3 text-sm font-semibold leading-6 text-gray-900">
                    {user.fullName}
                  </span>
                  <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <div className="border-b border-gray-100 px-4 py-2">
                      <p className="text-xs font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email ?? user.roleSummary}</p>
                    </div>

                    <form action="/login" method="GET">
                      <button
                        type="submit"
                        formAction={async () => {
                          const { signOutAction } = await import('@/features/auth/actions')
                          await signOutAction()
                        }}
                        className="flex w-full items-center gap-x-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 py-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

