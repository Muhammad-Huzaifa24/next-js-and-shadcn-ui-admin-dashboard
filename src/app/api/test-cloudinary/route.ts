import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/config/cloudinary';

export const runtime = 'nodejs';

/**
 * Test endpoint to verify Cloudinary configuration and upload capability
 * POST /api/test-cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[test-cloudinary] Testing Cloudinary configuration...');
    
    // Check if environment variables are available
    const envCheck = {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
      values: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET ? '[HIDDEN]' : 'MISSING'
      }
    };
    
    console.log('[test-cloudinary] Environment check:', envCheck);

    // First test: API ping
    try {
      const pingResult = await cloudinary.api.ping();
      console.log('[test-cloudinary] Ping result:', pingResult);
    } catch (pingError) {
      console.error('[test-cloudinary] Ping failed:', pingError);
      return NextResponse.json({
        success: false,
        error: 'Ping failed',
        details: pingError instanceof Error ? pingError.message : String(pingError),
        envCheck
      }, { status: 500 });
    }

    // Second test: Try to upload a small test image (base64 encoded 1x1 pixel)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    try {
      const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
        folder: 'studio-admin',
        public_id: `test-${Date.now()}`,
        resource_type: 'image',
        overwrite: true,
        secure: true,
      });
      
      console.log('[test-cloudinary] Upload successful:', uploadResult.secure_url);
      
      // Clean up test image
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('[test-cloudinary] Test image cleaned up');
      } catch (cleanupError) {
        console.warn('[test-cloudinary] Cleanup failed (not critical):', cleanupError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Cloudinary is working correctly',
        testUploadUrl: uploadResult.secure_url,
        envCheck
      });
      
    } catch (uploadError) {
      console.error('[test-cloudinary] Upload failed:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Upload failed',
        details: uploadError instanceof Error ? uploadError.message : String(uploadError),
        envCheck
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[test-cloudinary] Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}