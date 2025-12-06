import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Document from '@/models/Document';
import Lesson from '@/models/Lesson';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        const { name, description } = await req.json();

        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSubject);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
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
        // Also fetch documents for this subject (only those without a lessonId, or all? Let's say all direct ones for now, or maybe we want to separate them.
        // For now, let's keep fetching all documents for the subject, but the frontend can filter.
        // Actually, let's fetch lessons too.
        const documents = await Document.find({ subjectId: id }).select('-fileData').sort({ createdAt: -1 });
        const lessons = await Lesson.find({ subjectId: id }).sort({ createdAt: 1 });

        return NextResponse.json({ subject, documents, lessons });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
    }
}
