import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Correct import path used previously
import dbConnect from '@/lib/db';
import Document from '@/models/Document';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        const { title } = await req.json();

        const updatedDoc = await Document.findByIdAndUpdate(
            id,
            { title },
            { new: true, runValidators: true }
        );

        if (!updatedDoc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json(updatedDoc);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
}


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const document = await Document.findById(id);

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Check for download query param
        const url = new URL(req.url);
        const isDownload = url.searchParams.get('download') === 'true';

        // Return file content
        const headers = new Headers();
        headers.set('Content-Type', document.fileType);

        if (isDownload) {
            headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
        } else {
            headers.set('Content-Disposition', `inline; filename="${document.fileName}"`);
        }

        // Cache for 1 year, immutable as ID is unique to content version
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(document.fileData, {
            status: 200,
            headers,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        await Document.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Document deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}

