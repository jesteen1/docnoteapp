import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Document from '@/models/Document';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        const deletedSubject = await Subject.findByIdAndDelete(id);

        if (!deletedSubject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }

        await Document.deleteMany({ subjectId: id });
        return NextResponse.json({ message: 'Subject deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const subject = await Subject.findById(id);
        if (!subject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }
        // Also fetch documents for this subject
        const documents = await Document.find({ subjectId: id }).select('-fileData').sort({ createdAt: -1 }); // Exclude fileData for list view

        return NextResponse.json({ subject, documents });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
    }
}
