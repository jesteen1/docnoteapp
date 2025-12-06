'use client';

import { useEffect, useState, useCallback } from 'react';
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

interface Lesson {
    _id: string;
    title: string;
    description: string;
    subjectId: string;
}

export default function LessonPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploadProgress, setUploadProgress] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');

    // Modal and Toast state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<string | null>(null);
    const [editDocModalOpen, setEditDocModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editDocTitle, setEditDocTitle] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchLessonData = useCallback(() => {
        if (!params?.id) return;
        fetch(`/api/lessons/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                setLesson(data.lesson);
                setDocuments(data.documents);
                setEditTitle(data.lesson.title);
                setEditDesc(data.lesson.description || '');
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [params?.id]);

    useEffect(() => {
        fetchLessonData();
    }, [fetchLessonData]);

    const handleUpdateLesson = async () => {
        if (!lesson) return;
        try {
            const res = await fetch(`/api/lessons/${lesson._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, description: editDesc }),
            });

            if (res.ok) {
                setLesson({ ...lesson, title: editTitle, description: editDesc });
                setEditing(false);
                setToast({ message: 'Lesson updated successfully', type: 'success' });
            } else {
                setToast({ message: 'Failed to update lesson', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error updating lesson', type: 'error' });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0 || !lesson) return;

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

            const formData = new FormData();
            formData.append('file', file);

            // Determine title
            let title = uploadTitle.trim();
            if (!title) {
                title = file.name;
            } else if (files.length > 1) {
                title = `${title} (${i + 1})`;
            }

            formData.append('title', title);
            formData.append('subjectId', lesson.subjectId);
            formData.append('lessonId', lesson._id);

            try {
                const res = await fetch('/api/documents', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to upload ${file.name}`);
                }
            } catch (error) {
                console.error(`Error uploading ${file.name}`, error);
                failCount++;
            }
        }

        setUploading(false);
        setUploadProgress('');
        setFiles(null);
        setUploadTitle('');
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        if (successCount > 0) {
            setToast({ message: `Successfully uploaded ${successCount} documents`, type: 'success' });
            fetchLessonData();
        }
        if (failCount > 0) {
            // Maybe show a warning if some failed
            if (successCount === 0) {
                setToast({ message: 'Failed to upload documents', type: 'error' });
            }
        }
    };

    const confirmDelete = (id: string) => {
        setDocToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteDocument = async () => {
        if (!docToDelete) return;

        try {
            const res = await fetch(`/api/documents/${docToDelete}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setToast({ message: 'Document deleted successfully', type: 'success' });
                fetchLessonData();
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

    const openEditDocModal = (doc: Document) => {
        setEditingDoc(doc);
        setEditDocTitle(doc.title);
        setEditDocModalOpen(true);
    };

    const handleUpdateDocument = async () => {
        if (!editingDoc) return;

        const previousDocuments = [...documents];
        const optimisticDoc = { ...editingDoc, title: editDocTitle };

        // Optimistic update
        setDocuments(documents.map(d => d._id === editingDoc._id ? optimisticDoc : d));
        setEditDocModalOpen(false);
        setEditingDoc(null);

        try {
            const res = await fetch(`/api/documents/${editingDoc._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editDocTitle }),
            });

            if (res.ok) {
                const updatedDoc = await res.json();
                setDocuments(current => current.map(d => d._id === updatedDoc._id ? updatedDoc : d));
                setToast({ message: 'Document updated', type: 'success' });
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            setDocuments(previousDocuments);
            setToast({ message: 'Error updating document', type: 'error' });
        }
    };


    if (status === 'loading' || loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!lesson) {
        return <div className="text-center py-12">Lesson not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href={`/dashboard/subject/${lesson.subjectId}`} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Back to Subject
                </Link>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {editing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
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
                                        onClick={handleUpdateLesson}
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
                                    {lesson.title}
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </h1>
                                {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents to Lesson</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document Name (Optional)</label>
                        <input
                            type="text"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter a custom name for the document"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Files</label>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setFiles(e.target.files)}
                        />
                        <p className="mt-1 text-xs text-gray-500">You can select multiple files.</p>
                    </div>
                    {uploading && <p className="text-sm text-indigo-600">{uploadProgress}</p>}
                    <button
                        type="submit"
                        disabled={uploading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Upload size={16} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <li key={doc._id}>
                            <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                                                <p className="font-medium text-indigo-600 break-words text-sm sm:text-base">{doc.title}</p>
                                                <span className="hidden sm:inline mx-1 text-gray-500">-</span>
                                                <p className="font-normal text-gray-500 text-xs sm:text-sm truncate">
                                                    {doc.fileName}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                                    <p>
                                                        Uploaded on <FormattedDate date={doc.createdAt} />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex gap-2">
                                    <Link
                                        href={`/document/${doc._id}`}
                                        className="px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => confirmDelete(doc._id)}
                                        className="px-3 py-1 border border-red-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:text-red-500 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:text-red-800 active:bg-red-50 transition ease-in-out duration-150 flex items-center"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => openEditDocModal(doc)}
                                        className="px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-indigo-500 focus:outline-none focus:border-indigo-300 active:bg-gray-50 transition ease-in-out duration-150 flex items-center"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {documents.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No documents uploaded to this lesson yet.
                        </li>
                    )}
                </ul>
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

            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }

            <Modal
                isOpen={editDocModalOpen}
                onClose={() => setEditDocModalOpen(false)}
                title="Rename Document"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document Title</label>
                        <input
                            type="text"
                            value={editDocTitle}
                            onChange={(e) => setEditDocTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                            onClick={() => setEditDocModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
                            onClick={handleUpdateDocument}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
