"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function GenerateDocumentsUtility() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    status: 'idle' // idle, running, completed
  });
  const [results, setResults] = useState(null);

  const generateMemberPassHTML = (booking) => {
    const name = booking?.delegateDetails?.name ||
                 booking?.userDetails?.name ||
                 booking?.customerDetails?.name ||
                 booking?.vendorDetails?.name ||
                 'Participant';
    
    const bookingId = booking.id || 'N/A';
    const eventDate = booking?.eventDate || booking?.eventDetails?.date || new Date();
    
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #d97706; margin-bottom: 10px;">MEMBER PASS</h1>
        <div style="border: 2px solid #d97706; padding: 20px; border-radius: 8px;">
          <p style="font-size: 16px; font-weight: bold;">Name: ${name}</p>
          <p style="font-size: 14px;">Booking ID: ${bookingId}</p>
          <p style="font-size: 14px;">Event Date: ${new Date(eventDate).toLocaleDateString()}</p>
          <p style="color: #7c2d12; font-size: 12px; margin-top: 20px;">
            Please present this pass at the time of entry
          </p>
        </div>
      </div>
    `;
  };

  const generateReceiptHTML = (booking) => {
    const amount = booking.totalAmount || booking.payment?.amount || 0;
    const customerName = booking?.delegateDetails?.name ||
                        booking?.userDetails?.name ||
                        booking?.customerDetails?.name ||
                        'N/A';
    const bookingId = booking.id || 'N/A';
    const date = new Date().toLocaleDateString();
    
    return `
      <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto;">
        <h1 style="text-align: center; color: #1f2937;">BOOKING RECEIPT</h1>
        <hr style="border: 1px solid #d1d5db;">
        <div style="margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Status:</strong> ${booking.status || 'Confirmed'}</p>
        </div>
        <hr style="border: 1px solid #d1d5db;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          Thank you for your booking
        </p>
      </div>
    `;
  };

  const generateDocumentsForBooking = (booking) => {
    try {
      let memberPassUrl = null;
      let receiptUrl = null;
      
      try {
        const passHTML = generateMemberPassHTML(booking);
        memberPassUrl = `data:text/html;base64,${btoa(passHTML)}`;
      } catch (err) {
        console.warn('Could not generate member pass:', err);
      }
      
      if (booking.totalAmount > 0) {
        try {
          const receiptHTML = generateReceiptHTML(booking);
          receiptUrl = `data:text/html;base64,${btoa(receiptHTML)}`;
        } catch (err) {
          console.warn('Could not generate receipt:', err);
        }
      }
      
      return { memberPassUrl, receiptUrl };
    } catch (error) {
      console.error('Error generating booking documents:', error);
      return { memberPassUrl: null, receiptUrl: null };
    }
  };

  const handleGenerateForCollection = async (collectionName) => {
    try {
      setLoading(true);
      setProgress({ current: 0, total: 0, status: 'running' });

      // Fetch all bookings
      const q = collection(db, collectionName);
      const snapshot = await getDocs(q);
      
      setProgress(prev => ({ ...prev, total: snapshot.size }));

      let updated = 0;
      let failed = 0;
      let current = 0;

      // Update each booking
      for (const docSnapshot of snapshot.docs) {
        try {
          current++;
          setProgress(prev => ({ ...prev, current }));

          const booking = { id: docSnapshot.id, ...docSnapshot.data() };
          const docs = await generateDocumentsForBooking(booking);

          // Update Firestore
          await updateDoc(doc(db, collectionName, docSnapshot.id), {
            memberPassUrl: docs.memberPassUrl,
            receiptUrl: docs.receiptUrl,
            documentsGeneratedAt: new Date()
          });

          updated++;
        } catch (err) {
          console.error(`Failed for booking ${docSnapshot.id}:`, err);
          failed++;
        }
      }

      setResults({ updated, failed, total: snapshot.size, collection: collectionName });
      setProgress({ current: snapshot.size, total: snapshot.size, status: 'completed' });
      toast.success(`Generated documents for ${updated}/${snapshot.size} bookings`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate documents');
      setProgress({ current: 0, total: 0, status: 'idle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Member Pass & Receipt URLs</h2>
        <p className="text-gray-600">
          This utility generates and stores member pass and receipt URLs for all existing bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Havan Bookings */}
        <button
          onClick={() => handleGenerateForCollection('bookings')}
          disabled={loading}
          className="p-6 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Havan Bookings</h3>
            {!loading ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">Generate for 'bookings' collection</p>
          <span className="text-xs font-medium text-blue-600">
            {loading && progress.total > 0
              ? `${progress.current} / ${progress.total}`
              : 'Click to generate'}
          </span>
        </button>

        {/* Stall Bookings */}
        <button
          onClick={() => handleGenerateForCollection('stallBookings')}
          disabled={loading}
          className="p-6 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Stall Bookings</h3>
            {!loading ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">Generate for 'stallBookings' collection</p>
          <span className="text-xs font-medium text-purple-600">
            {loading && progress.total > 0
              ? `${progress.current} / ${progress.total}`
              : 'Click to generate'}
          </span>
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Completed!</h3>
              <p className="text-sm text-green-700">
                <strong>Collection:</strong> {results.collection}
              </p>
              <p className="text-sm text-green-700">
                <strong>Updated:</strong> {results.updated} / {results.total} bookings
              </p>
              {results.failed > 0 && (
                <p className="text-sm text-orange-700 mt-1">
                  <strong>Failed:</strong> {results.failed} bookings
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This generates data URLs (base64 encoded HTML)</li>
              <li>Documents will be stored in the database</li>
              <li>After generation, "Documents" buttons will appear in the booking tables</li>
              <li>You can then download the member pass and receipt from the admin panel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
