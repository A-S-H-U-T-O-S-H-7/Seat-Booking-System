"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, success, failed, pending
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'bookings');
      
      // Apply filters
      if (filter === 'success') {
        q = query(q, where('status', '==', 'confirmed'));
      } else if (filter === 'failed') {
        q = query(q, where('status', '==', 'payment_failed'));
      } else if (filter === 'pending') {
        q = query(q, where('status', '==', 'pending_payment'));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(100));
      
      const snapshot = await getDocs(q);
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (bookingId) => {
    if (!confirm('Are you sure you want to process this refund?')) return;
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'refunded',
        refundedAt: new Date(),
        refundedBy: 'admin' // You can get current admin user here
      });
      
      toast.success('Refund processed successfully');
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Success' },
      payment_failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => 
    payment.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment?.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStats = () => {
    const total = payments.length;
    const successful = payments.filter(p => p.status === 'confirmed').length;
    const failed = payments.filter(p => p.status === 'payment_failed').length;
    const pending = payments.filter(p => p.status === 'pending_payment').length;
    const totalAmount = payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    
    return { total, successful, failed, pending, totalAmount };
  };

  const stats = getPaymentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="mt-2 text-gray-600">Monitor and manage all payment transactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Successful</div>
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Filter Tabs */}
                <div className="flex space-x-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'success', label: 'Success' },
                    { key: 'failed', label: 'Failed' },
                    { key: 'pending', label: 'Pending' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        filter === tab.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by customer name, booking ID, or payment ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                        <div className="text-sm text-gray-500">
                          {payment.eventDate && format(payment.eventDate.toDate(), 'MMM dd, yyyy')} - {payment.shift}
                        </div>
                        <div className="text-sm text-gray-500">
                          Seats: {payment.seats?.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.customerDetails?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerDetails?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerDetails?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{payment.totalAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.payment ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              ID: {payment.payment.paymentId || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              Mode: {payment.payment.paymentMode || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              Gateway: {payment.payment.gateway || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No payment info</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.createdAt && format(payment.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.status === 'confirmed' && (
                          <button
                            onClick={() => handleRefund(payment.id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Refund
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No payments found matching your criteria</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
