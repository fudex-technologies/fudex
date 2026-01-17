import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	// Server-side redirect to home page
	return NextResponse.redirect(new URL('/', request.url));
}
