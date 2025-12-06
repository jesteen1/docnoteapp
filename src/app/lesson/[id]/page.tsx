'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import { useParams } from 'next/navigation';
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
    description?: string;
    subjectId: string;
}

export default function LessonPage() {
    const params = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetch(`/api/lessons/${params.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setLesson(data.lesson);
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
        return <LoadingSpinner fullScreen />;
    }

    if (!lesson) {
        return <div className="text-center py-12">Lesson not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href={`/subject/${lesson.subjectId}`} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Back to Subject
                </Link>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900 break-words">{lesson.title}</h1>
                        {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}
                    </div>
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
                            No documents available in this lesson.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
