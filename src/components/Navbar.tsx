'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-indigo-600">NotesApp</span>
                        </Link>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        {session?.user && (session.user as any).role === 'admin' && (
                            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                        )}
                        {session ? (
                            <button
                                onClick={() => signOut()}
                                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        ) : (
                            <Link href="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                <User size={18} /> Login
                            </Link>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                            Home
                        </Link>
                        {session?.user && (session.user as any).role === 'admin' && (
                            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Dashboard
                            </Link>
                        )}
                        {session ? (
                            <button
                                onClick={() => signOut()}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
