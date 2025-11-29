import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    const uri = process.env.MONGODB_URI;
    const secret = process.env.NEXTAUTH_SECRET;

    let dbStatus = 'disconnected';
    try {
        if (mongoose.connection.readyState === 1) {
            dbStatus = 'connected';
        } else if (uri) {
            // Try to connect if not connected
            await mongoose.connect(uri);
            dbStatus = 'connected_fresh';
        }
    } catch (e: any) {
        dbStatus = `error: ${e.message}`;
    }

    return NextResponse.json({
        env_vars: {
            MONGODB_URI_PRESENT: !!uri,
            NEXTAUTH_SECRET_PRESENT: !!secret,
            NEXTAUTH_URL_PRESENT: !!process.env.NEXTAUTH_URL,
        },
        db_status: dbStatus,
        node_env: process.env.NODE_ENV,
    });
}
