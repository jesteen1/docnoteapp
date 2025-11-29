'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Folder } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import FormattedDate from '@/components/FormattedDate';

interface Subject {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDesc, setNewSubjectDesc] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            // Optional: Check for admin role here if not handled by middleware/layout
            fetchSubjects();
        }
    }, [status, router]);

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/subjects');
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            } else {
                console.error('Failed to fetch subjects');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newSubjectName,
                    description: newSubjectDesc,
                }),
            });

            if (res.ok) {
                setNewSubjectName('');
                setNewSubjectDesc('');
                fetchSubjects();
                setToast({ message: 'Subject created successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'Failed to create subject', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const confirmDelete = (id: string) => {
        setSubjectToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) return;

        try {
            const res = await fetch(`/api/subjects/${subjectToDelete}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchSubjects();
                setToast({ message: 'Subject deleted successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ message: data.error || 'Failed to delete subject', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setSubjectToDelete(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Subject</h2>
                <form onSubmit={handleCreateSubject} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            required
                            placeholder="Subject Name"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newSubjectDesc}
                            onChange={(e) => setNewSubjectDesc(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Plus size={16} className="mr-2" />
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <div key={subject._id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 relative group">
                        <Link href={`/dashboard/subject/${subject._id}`} className="block p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <Folder className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                                    <p className="text-sm text-gray-500"><FormattedDate date={subject.createdAt} /></p>
                                </div>
                            </div>
                            {subject.description && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 line-clamp-2">{subject.description}</p>
                                </div>
                            )}
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete(subject._id);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors z-10 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Subject"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {subjects.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No subjects found. Create one to get started.</p>
                </div>
            )}

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Subject"
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete this subject? NOTE: This will permanently delete all documents inside it.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            id="confirm-delete-btn"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleDeleteSubject}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
