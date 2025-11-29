import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import { getServerSession } from 'next-auth';

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

        return new NextResponse(document.fileData, {
            status: 200,
            headers,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
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
