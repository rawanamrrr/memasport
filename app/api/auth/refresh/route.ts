import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgresql';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oldToken = authHeader.substring(7);

    // Verify old token
    const decoded = jwt.verify(oldToken, JWT_SECRET) as { userId: string; email: string };

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    // Create new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
