import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Vercel Blob Upload API
 * Handles file uploads for vendor images (cover images, product images)
 */
export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const folder = formData.get("folder") as string | null; // e.g., "vendors", "products"

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		// Validate file type (images only)
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Invalid file type. Only images are allowed." },
				{ status: 400 }
			);
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File size exceeds 5MB limit" },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = file.name.split(".").pop();
		const filename = `${folder || "uploads"}/${timestamp}-${randomString}.${extension}`;

		// Upload to Vercel Blob
		const blob = await put(filename, file, {
			access: "public",
			contentType: file.type,
		});

		return NextResponse.json({
			url: blob.url,
			pathname: blob.pathname,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{
				error: "Upload failed",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

