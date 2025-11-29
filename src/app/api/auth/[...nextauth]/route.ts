import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                // Check if any user exists, if not, create the first one as admin
                const userCount = await User.countDocuments();
                if (userCount === 0) {
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const newUser = await User.create({
                        email: credentials.email,
                        password: hashedPassword,
                        role: 'admin'
                    });
                    return { id: newUser._id.toString(), email: newUser.email, role: newUser.role };
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    return null;
                }

                const isPasswordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordMatch) {
                    return null;
                }

                return { id: user._id.toString(), email: user.email, role: user.role };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
