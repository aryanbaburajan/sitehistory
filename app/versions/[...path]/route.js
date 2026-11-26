import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.join(process.cwd(), "public", "versions");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};
export async function GET(request, { params }) {
  const { path: parts } = await params;
  // Historical Next.js exports may apply their base path twice.
  if (parts.length >= 3 && parts[1] === "versions" && parts[2] === parts[0]) {
    const url = new URL(request.url);
    url.pathname =
      "/versions/" +
      [parts[0], ...parts.slice(3)].map(encodeURIComponent).join("/");
    return Response.redirect(url, 308);
  }
  if (
    parts.some(
      (part) =>
        part === "." ||
        part === ".." ||
        part.includes("/") ||
        part.includes("\\"),
    )
  )
    return new Response("Not found", { status: 404 });
  let file = path.join(root, ...parts);
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type":
          types[path.extname(file).toLowerCase()] || "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
