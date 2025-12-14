import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { User } from '@/lib/models/User';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req) => {
      try {
        const { email, password } = await req.json();

        if (!email || !password) {
          return NextResponse.json({
            success: false,
            message: 'Email and password are required'
          }, { status: 400 });
        }

        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');

        // Find user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
          return NextResponse.json({
            success: false,
            message: 'Invalid credentials'
          }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return NextResponse.json({
            success: false,
            message: 'Invalid credentials'
          }, { status: 401 });
        }

        // Generate token
        const userWithoutPassword = {
          _id: user._id?.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        const token = generateToken(userWithoutPassword);

        // Create response with cookie
        const response = NextResponse.json({
          success: true,
          message: 'Login successful',
          user: userWithoutPassword
        });

        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
      } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
          success: false,
          message: 'Login failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    },
    {
      interval: 15 * 60 * 1000, // 15 minutes
      maxRequests: process.env.NODE_ENV === 'development' ? 50 : 5,
    }
  );
}
