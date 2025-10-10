"use client";
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import DistinguishedGuestsManagement from '@/components/admin/DistinguishedGuestsManagement';

export default function DistinguishedGuestsPage() {
  return (
    <ProtectedAdminRoute requiredPermissions={['MANAGE_CONTENT']}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <DistinguishedGuestsManagement />
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}