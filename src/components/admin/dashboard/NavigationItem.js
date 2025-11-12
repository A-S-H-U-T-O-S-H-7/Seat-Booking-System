import { 
  CalendarDaysIcon, 
  UsersIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  DocumentTextIcon,
  BanknotesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export const navigationItems = [
  {
    id: 'overview',
    name: 'Overview',
    icon: ChartBarIcon,
    permission: 'view_overview' // Now requires permission
  },
  {
    id: 'seats',
    name: 'Havan Seats',
    icon: Cog6ToothIcon,
    permission: 'manage_seats'
  },
  {
    id: 'stalls',
    name: 'Stall Seats',
    icon: Cog6ToothIcon,
    permission: 'manage_stalls'
  },
  {
    id: 'show-seats',
    name: 'Show Seats',
    icon: CalendarDaysIcon,
    permission: 'manage_show_seats' // Separate permission
  },
  {
    id: 'bookings',
    name: 'Havan Bookings',
    icon: UsersIcon,
    permission: 'view_havan_bookings' // Separate permission
  },
  {
    id: 'stall-bookings',
    name: 'Stall Bookings',
    icon: UsersIcon,
    permission: 'view_stall_bookings' // Separate permission
  },
  {
    id: 'show-bookings',
    name: 'Show Bookings',
    icon: UsersIcon,
    permission: 'view_show_bookings' // Separate permission
  },
  {
    id: 'delegate-bookings',
    name: 'Delegate Bookings',
    icon: UserPlusIcon,
    permission: 'view_delegate_bookings' // Separate permission
  },
  {
    id: 'donations',
    name: 'Donations',
    icon: HeartIcon,
    permission: 'view_donations'
  },
  {
    id: 'sponsor-performer',
    name: 'Sponsors & Performers',
    icon: UserPlusIcon,
    permission: 'view_sponsor_performer'
  },
  {
    id: 'cancellations',
    name: 'Cancellation & Refunds',
    icon: BanknotesIcon,
    permission: 'manage_cancellations'
  },
  {
    id: 'users',
    name: 'User Management',
    icon: UsersIcon,
    permission: 'view_users'
  },
  {
    id: 'distinguished-guests',
    name: 'Distinguished Guests',
    icon: StarIcon,
    permission: null // No permission required - should always show
  },
  {
    id: 'pricing',
    name: 'Price Settings',
    icon: CurrencyRupeeIcon,
    permission: 'manage_pricing'
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    icon: Cog6ToothIcon,
    permission: 'manage_settings'
  },
  {
    id: 'admins',
    name: 'Admin Management',
    icon: UserPlusIcon,
    permission: 'manage_admins'
  },
  {
    id: 'logs',
    name: 'Activity Logs',
    icon: DocumentTextIcon,
    permission: 'view_logs'
  },
  {
    id: 'generate-documents',
    name: 'Generate Documents',
    icon: DocumentTextIcon,
    permission: 'manage_bookings'
  }
];
