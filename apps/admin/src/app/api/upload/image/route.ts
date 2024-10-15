import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "~admin/lib/aws-s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    if (!file || !folder) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const fileUrl = await uploadImage(file, folder);
    return new NextResponse(JSON.stringify({ fileUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error(e);
  }
}
