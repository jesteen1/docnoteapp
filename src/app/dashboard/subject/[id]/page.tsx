'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Upload, FileText, ArrowLeft, Download, Edit2, Save, X } from 'lucide-react';

import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import FormattedDate from '@/components/FormattedDate';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Document {
    _id: string;
    title: string;
    fileType: string;
    fileName: string;
    createdAt: string;
}

interface Subject {
    _id: string;
    name: string;
    description: string;
}

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    createdAt: string;
}

export default function SubjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonDesc, setNewLessonDesc] = useState('');

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');

    // Modal and Toast state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<string | null>(null);
    const [deleteLessonModalOpen, setDeleteLessonModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
    const [editLessonModalOpen, setEditLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [editLessonTitle, setEditLessonTitle] = useState('');
    const [editLessonDesc, setEditLessonDesc] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if ((session?.user as any).role !== 'admin') {
                router.push('/');
            } else if (params?.id) {
                fetchSubjectData();
            }
        }
    }, [status, session, router, params?.id]);

    const fetchSubjectData = () => {
        fetch(`/api/subjects/${params?.id}`)
            .then((res) => res.json())
            .then((data) => {
                setSubject(data.subject);
                setDocuments(data.documents);
                setLessons(data.lessons || []);
                setEditName(data.subject.name);
                setEditDesc(data.subject.description || '');
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleUpdateSubject = async () => {
        if (!subject) return;
        try {
            const res = await fetch(`/api/subjects/${subject._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, description: editDesc }),
            });

            if (res.ok) {
                setSubject({ ...subject, name: editName, description: editDesc });
                setEditing(false);
                setToast({ message: 'Subject updated successfully', type: 'success' });
            } else {
                setToast({ message: 'Failed to update subject', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error updating subject', type: 'error' });
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLessonTitle || !params?.id) return;
        setCreatingLesson(true);

        try {
            const res = await fetch(`/api/subjects/${params.id}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newLessonTitle, description: newLessonDesc }),
            });

            if (res.ok) {
                setNewLessonTitle('');
                setNewLessonDesc('');
                fetchSubjectData();
                setToast({ message: 'Lesson created successfully', type: 'success' });
            } else {
                setToast({ message: 'Failed to create lesson', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error creating lesson', type: 'error' });
        } finally {
            setCreatingLesson(false);
        }
    };

    const openEditLessonModal = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setEditLessonTitle(lesson.title);
        setEditLessonDesc(lesson.description || '');
        setEditLessonModalOpen(true);
    };

    const handleUpdateLesson = async () => {
        if (!editingLesson) return;

        const previousLessons = [...lessons];
        const optimisticLesson = { ...editingLesson, title: editLessonTitle, description: editLessonDesc };

        // Optimistic update
        setLessons(lessons.map(l => l._id === editingLesson._id ? optimisticLesson : l));
        setEditLessonModalOpen(false);
        setEditingLesson(null);

        try {
            const res = await fetch(`/api/lessons/${editingLesson._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editLessonTitle, description: editLessonDesc }),
            });

            if (res.ok) {
                const updatedLesson = await res.json();
                setLessons(current => current.map(l => l._id === updatedLesson._id ? updatedLesson : l));
                setToast({ message: 'Lesson updated', type: 'success' });
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            setLessons(previousLessons);
            setToast({ message: 'Error updating lesson', type: 'error' });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !params?.id) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('subjectId', params.id as string);

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setTitle('');
                setFile(null);
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchSubjectData();
            } else {
                alert('Failed to upload document');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading document');
        } finally {
            setUploading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDocToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDeleteLesson = (id: string) => {
        setLessonToDelete(id);
        setDeleteLessonModalOpen(true);
    };

    const handleDeleteDocument = async () => {
        if (!docToDelete) return;

        try {
            const res = await fetch(`/api/documents/${docToDelete}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setToast({ message: 'Document deleted successfully', type: 'success' });
                fetchSubjectData();
            } else {
                setToast({ message: 'Failed to delete document', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error deleting document', type: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setDocToDelete(null);
        }
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;

        try {
            const res = await fetch(`/api/lessons/${lessonToDelete}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setToast({ message: 'Lesson deleted successfully', type: 'success' });
                fetchSubjectData();
            } else {
                setToast({ message: 'Failed to delete lesson', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error deleting lesson', type: 'error' });
        } finally {
            setDeleteLessonModalOpen(false);
            setLessonToDelete(null);
        }
    };


    if (status === 'loading' || loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!subject) {
        return <div className="text-center py-12">Subject not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {editing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="block w-full text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="block w-full text-gray-600 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                                    placeholder="Description"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleUpdateSubject}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Save size={14} className="mr-1" /> Save
                                    </button>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <X size={14} className="mr-1" /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    {subject.name}
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </h1>
                                {subject.description && <p className="mt-2 text-gray-600">{subject.description}</p>}
                            </div>
                        )}
                    </div>
                    {documents.length > 0 && (
                        <a
                            href={`/api/subjects/${subject._id}/download`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <Download size={16} className="mr-2" />
                            Download All
                        </a>
                    )}
                </div>
            </div>

            {/* Lessons Section */}
            <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Lessons</h2>

                {/* Create Lesson Form */}
                <form onSubmit={handleCreateLesson} className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            required
                            placeholder="Lesson Title"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newLessonDesc}
                            onChange={(e) => setNewLessonDesc(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creatingLesson}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {creatingLesson ? 'Creating...' : 'Add Lesson'}
                    </button>
                </form>

                {/* Lessons List */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {lessons.map((lesson) => (
                        <div key={lesson._id} className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/dashboard/lesson/${lesson._id}`} className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                    <p className="text-sm text-gray-500 truncate">{lesson.description}</p>
                                </Link>
                            </div>
                            <div className="flex-shrink-0 z-10">
                                <button
                                    onClick={() => confirmDeleteLesson(lesson._id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => openEditLessonModal(lesson)}
                                    className="text-gray-400 hover:text-indigo-600 ml-2"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <p className="text-gray-500 text-sm col-span-2 text-center py-4">No lessons created yet.</p>
                    )}
                </div>
            </div>



            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Document"
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete this document? This action cannot be undone.
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
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleDeleteDocument}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteLessonModalOpen}
                onClose={() => setDeleteLessonModalOpen(false)}
                title="Delete Lesson"
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete this lesson? All documents inside it will also be deleted.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => setDeleteLessonModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                            onClick={handleDeleteLesson}
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

            <Modal
                isOpen={editLessonModalOpen}
                onClose={() => setEditLessonModalOpen(false)}
                title="Edit Lesson"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lesson Title</label>
                        <input
                            type="text"
                            value={editLessonTitle}
                            onChange={(e) => setEditLessonTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            value={editLessonDesc}
                            onChange={(e) => setEditLessonDesc(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                            onClick={() => setEditLessonModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
                            onClick={handleUpdateLesson}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
