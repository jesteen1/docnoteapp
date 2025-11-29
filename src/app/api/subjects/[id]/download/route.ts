import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import Subject from '@/models/Subject';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const subject = await Subject.findById(id);
        if (!subject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }

        const documents = await Document.find({ subjectId: id });
        if (!documents || documents.length === 0) {
            return NextResponse.json({ error: 'No documents found' }, { status: 404 });
        }

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const stream = new PassThrough();
        archive.pipe(stream);

        documents.forEach((doc) => {
            if (doc.fileData && doc.fileName) {
                archive.append(doc.fileData, { name: doc.fileName });
            }
        });

        archive.finalize();

        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="${subject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_documents.zip"`);

        // @ts-ignore - NextResponse supports Node.js streams in Node runtime
        return new NextResponse(stream, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download all error:', error);
        return NextResponse.json({ error: 'Failed to create archive' }, { status: 500 });
    }
}
