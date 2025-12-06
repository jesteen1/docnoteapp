import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const lessons = await Lesson.find({ subjectId: id }).sort({ createdAt: 1 });
        return NextResponse.json(lessons);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { id } = await params;
        const { title, description } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const lesson = await Lesson.create({
            title,
            description,
            subjectId: id,
        });

        return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
    }
}
