'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function DocumentViewer() {
    const params = useParams();
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            // Direct API URL for the file
            const url = `/api/documents/${params.id}`;
            setFileUrl(url);

            // Fetch headers to get content type (optional, but good for deciding how to render)
            fetch(url, { method: 'HEAD' })
                .then(res => {
                    setFileType(res.headers.get('Content-Type') || '');
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [params?.id]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
    }

    if (!fileUrl) {
        return <div className="text-center py-12">Document not found</div>;
    }

    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
                <button onClick={() => window.history.back()} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <ArrowLeft size={16} /> Back
                </button>
                <a
                    href={fileUrl}
                    download
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                >
                    <Download size={16} /> Download
                </a>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex justify-center items-center relative">
                {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                ) : isPdf ? (
                    <iframe src={fileUrl} className="w-full h-full" title="PDF Viewer" />
                ) : (
                    <div className="text-center p-8">
                        <p className="text-gray-500 mb-4">This file type cannot be previewed directly.</p>
                        <a
                            href={fileUrl}
                            download
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Download File
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
