import type { Metadata } from 'next'
import Link from 'next/link'
import {
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  ShieldExclamationIcon,
  BellIcon,
  CubeIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { roleLabel } from '@/features/auth/lib/roles'
import { requireActiveUser } from '@/features/auth/services/session'
import { canViewInventory } from '@/features/inventory/lib/permissions'
import { ApiHealthStatus } from '@/features/status/components/ApiHealthStatus'
import { getDashboardMetrics } from '@/features/workflows/services/workflows'

export const metadata: Metadata = {
  title: 'Dashboard | SISS',
}

export default async function DashboardPage() {
  const profile = await requireActiveUser()
  const isAdmin = profile.roles.some(({ role }) => role === 'admin')
  const canAccessInventory = canViewInventory(profile)
  const isStaff = profile.roles.some(({ role }) =>
    ['admin', 'office_head', 'office_staff'].includes(role)
  )
  const metrics = await getDashboardMetrics(profile.id)

  const kpiCards = [
    {
      label: 'My Requests',
      value: metrics.myRequests,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/requests',
    },
    {
      label: 'Pending Reviews',
      value: metrics.pending,
      icon: ClockIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      href: isStaff ? '/requests' : undefined,
    },
    {
      label: 'Low Stock Alerts',
      value: metrics.lowStock,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      href: canAccessInventory ? '/inventory' : undefined,
    },
    {
      label: 'Active Loans',
      value: metrics.activeLoans,
      icon: ArrowsRightLeftIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      href: '/borrowings',
    },
    {
      label: 'Overdue Items',
      value: metrics.overdue,
      icon: ShieldExclamationIcon,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      href: '/borrowings',
    },
    {
      label: 'Open Incidents',
      value: metrics.openIncidents,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      href: '/incidents',
    },
    {
      label: 'Unread Alerts',
      value: metrics.unread,
      icon: BellIcon,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      href: '/notifications',
    },
    {
      label: 'Office Catalog',
      value: canAccessInventory ? 'Active' : 'Restricted',
      icon: CubeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      href: canAccessInventory ? '/inventory' : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      {/* DCASIS Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center text-sm font-medium text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-600 transition">
          Home
        </Link>
        <ChevronRightIcon className="mx-2 h-4 w-4 text-gray-400" />
        <span className="text-blue-600 font-semibold">Dashboard</span>
      </nav>

      {/* Page Header matching DCASIS: text-3xl font-bold text-blue-500 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-blue-500 tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, <span className="font-semibold text-gray-900">{profile.fullName}</span>.
            Live activity and status for{' '}
            <span className="font-medium text-blue-700">
              {profile.officeName ?? 'Institutional Custodian Portal'}
            </span>
            .
          </p>
        </div>

        {/* Action Buttons matching DCASIS FormButton */}
        <div className="flex items-center gap-3">
          <Link
            href="/requests/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            + New Request
          </Link>
          {canAccessInventory && (
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center rounded-md bg-white border border-blue-500 px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition"
            >
              Manage Stock
            </Link>
          )}
        </div>
      </div>

      {/* DCASIS Tabs Underline navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/dashboard"
            className="border-blue-500 text-blue-600 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-bold"
            aria-current="page"
          >
            Overview &amp; Metrics
          </Link>
          <Link
            href="/requests"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition"
          >
            Requests Flow
          </Link>
          <Link
            href="/reservations"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition"
          >
            Reservations
          </Link>
          <Link
            href="/borrowings"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition"
          >
            Equipment Borrowings
          </Link>
        </nav>
      </div>

      {/* Health Indicator */}
      <ApiHealthStatus />

      {/* KPI Cards Grid matching DCASIS card styling */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Content = (
            <div className="relative overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor} ${card.color} border ${card.borderColor}`}
                >
                  <card.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              {card.href && (
                <div className="mt-3 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800">
                  <span>View records</span>
                  <ArrowRightIcon className="ml-1 h-3 w-3" />
                </div>
              )}
            </div>
          )

          return card.href ? (
            <Link key={card.label} href={card.href} className="block">
              {Content}
            </Link>
          ) : (
            <div key={card.label}>{Content}</div>
          )
        })}
      </div>

      {/* Two Column Layout: Profile Summary & Role Access Control */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Account Identity</h3>
                <p className="text-xs text-gray-500">Verified Supabase Auth Profile</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active Account
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-md bg-gray-50 p-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase">Full Name</dt>
              <dd className="mt-1 font-bold text-gray-900">{profile.fullName}</dd>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase">School ID</dt>
              <dd className="mt-1 font-bold text-gray-900">{profile.schoolId ?? 'Not recorded'}</dd>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase">Assigned Office</dt>
              <dd className="mt-1 font-bold text-gray-900">{profile.officeName ?? 'Institutional (Cross-Office)'}</dd>
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <dt className="text-xs font-semibold text-gray-500 uppercase">Security Boundary</dt>
              <dd className="mt-1 font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                RLS Enforced
              </dd>
            </div>
          </dl>
        </div>

        {/* Roles & Office Permissions Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Assigned Roles &amp; Scopes</h3>
                <p className="text-xs text-gray-500">Multi-Role RBAC Authorization</p>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                Manage Permissions →
              </Link>
            )}
          </div>

          <div className="mt-4 space-y-2.5">
            {profile.roles.length > 0 ? (
              profile.roles.map(({ role, officeId, officeName }) => (
                <div
                  key={`${role}-${officeId ?? 'global'}`}
                  className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/70 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
                      {role.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{roleLabel(role)}</p>
                      <p className="text-xs text-gray-500">{officeName ?? 'School-wide access scope'}</p>
                    </div>
                  </div>
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-blue-600 border border-gray-200">
                    Authorized
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No active roles assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Action Bar if Admin */}
      {isAdmin && (
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Administrator Control Center</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Configure participating offices, manage system user accounts, grant office roles, and view comprehensive audit trails.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link
              href="/admin/users"
              className="rounded-md bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition"
            >
              Users Directory
            </Link>
            <Link
              href="/admin/offices"
              className="rounded-md bg-blue-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-900 border border-blue-400 transition"
            >
              Office Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
