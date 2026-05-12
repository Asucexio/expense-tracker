'use client';

import Link from 'next/link';
import { useState } from 'react';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import Image from "next/image"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/auth/forgot-password', { email });

            if (response.data.success) {
                toast.success('Password reset link sent to your email!');
                setSubmitted(true);
                setEmail('');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="card text-center">
                        <div className="text-5xl mb-4">✉️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                        <p className="text-gray-600 mb-4">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-gray-600 mb-6">
                            The link will expire in 30 minutes. Click the link to reset your password.
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
                            <p className="text-sm text-blue-900">
                                <strong>Didn't receive the email?</strong>
                                <br />
                                Check your spam folder or try again with a different email.
                            </p>
                        </div>

                        <Link
                            href="/auth/login"
                            className="btn btn-primary w-full py-2 mb-3"
                        >
                            Back to Login
                        </Link>

                        <button
                            onClick={() => setSubmitted(false)}
                            className="btn btn-secondary w-full py-2"
                        >
                            Try Another Email
                        </button>
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
                    <p className="text-gray-600">Reset your password</p>
                </div>

                {/* Form Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                            <p className="font-medium mb-1">Forgot your password?</p>
                            <p>Enter your email and we'll send you a link to reset it.</p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 mr-2 " /> */}
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    disabled={loading}
                                    className="p-10 text-semibold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Links */}
                    <div className="space-y-2 text-center text-sm">
                        <Link
                            href="/auth/login"
                            className="flex items-center justify-center gap-2 text-blue-600 hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}