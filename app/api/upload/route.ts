import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/gridfs';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req) => {
      try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
          return NextResponse.json(
            { success: false, message: 'No file provided' },
            { status: 400 }
          );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          return NextResponse.json(
            { success: false, message: 'Invalid file type. Only images are allowed.' },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          return NextResponse.json(
            { success: false, message: 'File too large. Max size is 5MB.' },
            { status: 400 }
          );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to GridFS
        const fileId = await uploadFile(buffer, file.name, file.type);

        return NextResponse.json({
          success: true,
          fileId: fileId.toString(),
          url: `/api/files/${fileId.toString()}`,
          filename: file.name
        });
      } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to upload file' },
          { status: 500 }
        );
      }
    },
    {
      interval: 60 * 60 * 1000, // 1 hour
      maxRequests: process.env.NODE_ENV === 'development' ? 100 : 20,
    }
  );
}
