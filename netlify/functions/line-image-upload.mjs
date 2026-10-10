
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default async (request) => {
  const baseUrl = new URL(request.url).origin;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method === "GET") {
    const id = new URL(request.url).searchParams.get("id");

    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
      return new Response("Invalid image ID", { status: 400 });
    }

    const store = getStore("em-line-images");
    const image = await store.get(id, { type: "arrayBuffer" });

    if (!image) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return json({ error: "請提供名為 file 的 PNG 圖片" }, 400);
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return json({ error: "圖片必須大於 0 且不可超過 8 MB" }, 413);
    }

    if (file.type !== "image/png") {
      return json({ error: "目前只接受 PNG 圖片" }, 415);
    }

    const bytes = await file.arrayBuffer();
    const signature = new Uint8Array(bytes.slice(0, 8));
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

    if (
      signature.length !== 8 ||
      !pngSignature.every((value, index) => signature[index] === value)
    ) {
      return json({ error: "圖片格式不正確" }, 415);
    }

    const id = randomUUID();
    const store = getStore("em-line-images");

    await store.set(id, bytes, {
      metadata: {
        contentType: "image/png",
        uploadedAt: new Date().toISOString(),
      },
    });

    const imageUrl =
      `${baseUrl}/.netlify/functions/line-image-upload?id=${id}`;

    return json({
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return json({ error: "圖片上傳失敗，請稍後再試" }, 500);
  }
};
