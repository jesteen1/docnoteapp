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
    const params = useParams();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetch(`/api/subjects/${params.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setSubject(data.subject);
                    setDocuments(data.documents);
                    setLessons(data.lessons || []);
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

    if (!subject) {
        return <div className="text-center py-12">Subject not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
                    <ArrowLeft size={16} /> Back to Subjects
                </Link>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900 break-words">{subject.name}</h1>
                        {subject.description && <p className="mt-2 text-gray-600">{subject.description}</p>}
                    </div>
                    {documents.length > 0 && (
                        <a
                            href={`/api/subjects/${subject._id}/download`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shrink-0"
                        >
                            <Download size={16} className="mr-2" />
                            Download All
                        </a>
                    )}
                </div>
            </div>

            {/* Lessons Section */}
            {lessons.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Lessons</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson) => (
                            <Link href={`/lesson/${lesson._id}`} key={lesson._id} className="block">
                                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                                <FileText className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">{lesson.title}</h3>
                                                {lesson.description && <p className="text-sm text-gray-500 truncate">{lesson.description}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
}
