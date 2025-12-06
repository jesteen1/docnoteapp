import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';
import Document from '@/models/Document';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        const documents = await Document.find({ lessonId: id }).select('-fileData').sort({ createdAt: -1 });

        return NextResponse.json({ lesson, documents });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
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
        const deletedLesson = await Lesson.findByIdAndDelete(id);

        if (!deletedLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Delete all documents associated with this lesson
        await Document.deleteMany({ lessonId: id });

        return NextResponse.json({ message: 'Lesson deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        const { title, description } = await req.json();

        const updatedLesson = await Lesson.findByIdAndUpdate(
            id,
            { title, description },
            { new: true, runValidators: true }
        );

        if (!updatedLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json(updatedLesson);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}
