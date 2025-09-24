"use client";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reset form...</p>
      </div>
    </div>
  );
}

// Export the main page component wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

// Main reset password component
function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState("");

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      toast.error("Invalid reset link. Please request a new password reset.");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(oobCode, newPassword);
      toast.success("Password reset successfully! You can now login.");
      router.push("/login");
    } catch (error) {
      let errorMessage = "Failed to reset password";
      
      switch (error.code) {
        case 'auth/expired-action-code':
          errorMessage = "Reset link has expired. Please request a new one.";
          break;
        case 'auth/invalid-action-code':
          errorMessage = "Invalid reset link. Please request a new one.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        default:
          errorMessage = error.message || "Failed to reset password";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🔑</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-500 mt-1">Passwords match ✓</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remembered your password?{" "}
              <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                Back to Sign In
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}