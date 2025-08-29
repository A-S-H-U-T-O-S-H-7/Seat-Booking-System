"use client";
import DonationManagement from '@/components/admin/donation-management/DonationManagement';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';

export default function DonationsPage() {
  return (
    <ProtectedAdminRoute>
      <div className="p-6">
        <DonationManagement />
      </div>
    </ProtectedAdminRoute>
  );
}

export const metadata = {
  title: 'Donation Management | Admin Panel',
  description: 'Manage and track all donations in the system',
};
