import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';

export async function GET() {
    await dbConnect();
    try {
        const subjects = await Subject.find({}).sort({ createdAt: -1 });
        return NextResponse.json(subjects);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }
}

import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { name, description } = await req.json();
        const subject = await Subject.create({ name, description });
        return NextResponse.json(subject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }
}
