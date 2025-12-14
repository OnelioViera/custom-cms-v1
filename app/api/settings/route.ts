import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models/Content';

// GET settings
export async function GET() {
  try {
    const db = await getDatabase();
    const settingsCollection = db.collection<SiteSettings>('settings');
    
    // Get the first (and only) settings document
    const settings = await settingsCollection.findOne({});

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        settings: {
          siteName: '',
          siteDescription: '',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          contactEmail: '',
          contactPhone: '',
          address: '',
          socialMedia: {},
          seo: {
            defaultMetaTitle: '',
            defaultMetaDescription: ''
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        _id: settings._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch settings'
    }, { status: 500 });
  }
}

// POST/PUT update settings (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const settingsCollection = db.collection<SiteSettings>('settings');

    const settingsData: Partial<SiteSettings> = {
      siteName: body.siteName,
      siteDescription: body.siteDescription,
      logo: body.logo,
      favicon: body.favicon,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      socialMedia: {
        facebook: body.socialMedia?.facebook || '',
        twitter: body.socialMedia?.twitter || '',
        linkedin: body.socialMedia?.linkedin || '',
        instagram: body.socialMedia?.instagram || ''
      },
      seo: {
        defaultMetaTitle: body.seo?.defaultMetaTitle || '',
        defaultMetaDescription: body.seo?.defaultMetaDescription || ''
      },
      updatedAt: new Date(),
      updatedBy: body.updatedBy || 'admin'
    };

    // Upsert - update if exists, insert if doesn't
    const result = await settingsCollection.updateOne(
      {},
      { $set: settingsData },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update settings'
    }, { status: 500 });
  }
}
