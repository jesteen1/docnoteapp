import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const subjectId = formData.get('subjectId') as string;
        const lessonId = formData.get('lessonId') as string | null;

        if (!file || !title || !subjectId || !lessonId) {
            return NextResponse.json({ error: 'Missing fields: file, title, subjectId, and lessonId are required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Create a copy to ensure it's a safe Buffer for MongoDB driver
        const safeBuffer = Buffer.from(buffer);

        const documentData: any = {
            title,
            subjectId,
            lessonId,
            fileData: safeBuffer,
            fileType: file.type,
            fileName: file.name,
        };

        const document = await Document.create(documentData);

        return NextResponse.json({ message: 'Document uploaded', documentId: document._id }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/documents:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}
