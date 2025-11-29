'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Upload, FileText, ArrowLeft, Download } from 'lucide-react';

import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import FormattedDate from '@/components/FormattedDate';

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

export default function SubjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');

    // Modal and Toast state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<string | null>(null);
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
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
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

    if (status === 'loading' || loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
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
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
                        {subject.description && <p className="mt-2 text-gray-600">{subject.description}</p>}
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

            <div className="bg-white shadow sm:rounded-lg mb-8 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document Title</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">File</label>
                        <input
                            id="file-upload"
                            type="file"
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
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
                                        <div className="ml-4 truncate">
                                            <div className="flex text-sm">
                                                <p className="font-medium text-indigo-600 truncate">{doc.title}</p>
                                                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                    - {doc.fileName}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex">
                                                <div className="flex items-center text-sm text-gray-500">
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
                                </div>
                            </div>
                        </li>
                    ))}
                    {documents.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No documents uploaded yet.
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
