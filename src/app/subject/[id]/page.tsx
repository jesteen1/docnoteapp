'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import { useParams } from 'next/navigation';
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
    const params = useParams();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetch(`/api/subjects/${params.id}`)
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
        }
    }, [params?.id]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
    }

    if (!subject) {
        return <div className="text-center py-12">Subject not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Back to Subjects
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
                                    <a
                                        href={`/api/documents/${doc._id}?download=true`}
                                        download={doc.fileName}
                                        className="px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 flex items-center"
                                    >
                                        <Download size={16} />
                                    </a>
                                </div>
                            </div>
                        </li>
                    ))}
                    {documents.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No documents available in this subject.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
