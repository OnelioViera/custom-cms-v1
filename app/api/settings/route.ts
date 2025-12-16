import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET settings
export async function GET() {
  try {
    const db = await getDatabase();
    const settingsCollection = db.collection('settings');
    
    let settings = await settingsCollection.findOne({ _id: 'site-settings' as any });
    
    // Return default settings if none exist
    if (!settings) {
      settings = {
        _id: 'site-settings',
        featuredProjectsLimit: 3,
      };
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const settingsCollection = db.collection('settings');

    await settingsCollection.updateOne(
      { _id: 'site-settings' as any },
      { 
        $set: {
          featuredProjectsLimit: data.featuredProjectsLimit || 3,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
