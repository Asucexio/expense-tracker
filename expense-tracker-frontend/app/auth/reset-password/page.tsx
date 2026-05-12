'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from "next/image"

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            toast.error('Invalid reset link');
        }
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });

            if (response.data.success) {
                toast.success('Password reset successful!');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
            if (error.response?.status === 400) {
                setTokenValid(false);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="card text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>

                        <Link href="/auth/forgot-password" className="btn btn-primary w-full py-2">
                            Request New Reset Link
                        </Link>
                        <Link href="/auth/login" className="btn btn-secondary w-full py-2 mt-3">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/vaulto-logo-dark.svg"
                        alt="vaulto"
                        width={200}
                        height={200}
                        priority
                        className="hover:scale-105 transition-transform duration-300"
                    />
                    <p className="text-gray-600">Create a new password</p>
                </div>

                {/* Form Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Info */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
                            <p className="font-medium">✓ Your reset link is valid</p>
                            <p>Enter a new password below</p>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Links */}
                    <div className="text-center text-sm">
                        <Link
                            href="/auth/login"
                            className="flex items-center justify-center gap-2 text-blue-600 hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}