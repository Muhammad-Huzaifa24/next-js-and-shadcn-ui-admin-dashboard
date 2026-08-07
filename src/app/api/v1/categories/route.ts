import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { createCategorySchema, CreateCategoryInput } from '@/validators/category.schema';
import { listCategories, createCategory } from '@/services/category.service';

export const runtime = 'nodejs';

/**
 * GET /api/v1/categories
 * 
 * List all categories
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call service layer
    const categories = await listCategories();

    return NextResponse.json(
      {
        success: true,
        data: { categories },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * POST /api/v1/categories
 * 
 * Create a new category
 * Supports both JSON and multipart/form-data (for image upload)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[categories POST] Starting request processing...');
    
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      console.log('[categories POST] Authentication failed');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('[categories POST] Authentication successful');

    let data: any;
    let file: File | undefined;

    // Handle both JSON and multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    console.log('[categories POST] Content-Type:', contentType);
    
    if (contentType.includes('multipart/form-data')) {
      console.log('[categories POST] Processing multipart/form-data...');
      const formData = await request.formData();
      
      // Extract form fields
      data = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          file = value;
          console.log('[categories POST] File detected:', { name: value.name, type: value.type, size: value.size });
        } else {
          data[key] = value;
        }
      }
    } else {
      console.log('[categories POST] Processing JSON data...');
      data = await request.json();
    }
    
    console.log('[categories POST] Parsed data:', { ...data, hasFile: !!file });

    // Validate core data (excluding file)
    const validation = await validateRequest<CreateCategoryInput>(
      new Request(request.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      }),
      createCategorySchema
    );
    
    if (!validation.success) {
      console.log('[categories POST] Validation failed');
      return validation.error;
    }
    
    console.log('[categories POST] Validation successful');

    // Add file to the data if present - now validation.data is properly typed
    const categoryData = { ...validation.data, file };

    console.log('[categories POST] Calling createCategory service...');
    // Call service layer
    const category = await createCategory(categoryData);
    
    console.log('[categories POST] Category created successfully:', category._id);

    return NextResponse.json(
      {
        success: true,
        data: { category },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[categories POST] Error in route handler:', err);
    return handleRouteError(err);
  }
}