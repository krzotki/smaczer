import { s3Client } from "@/utils/awsConfig";
import { Upload } from "@aws-sdk/lib-storage";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth(); // Assumed authentication function

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as File) || null;
  console.log({ formData, body, file });
  try {
    const uploader = new Upload({
      client: s3Client,
      params: {
        Bucket: "kr-smaczer-images",
        Key: `uploads/${new Date().getTime()}-${file.name}`, // Example filename with timestamp
        Body: file,
      },
    });

    const res = await uploader.done();
    return new Response(
      JSON.stringify({ message: "Upload successful", url: res.Location }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Upload failed", error);
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
    });
  }
}
