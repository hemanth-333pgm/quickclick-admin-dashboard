export default async function handler(req, res) {
  const BACKEND = "https://quickclick-backend-136h.onrender.com";

  // req.url is like /api/v1/auth/send-otp
  const target = BACKEND + req.url;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers["content-length"];
  delete headers["accept-encoding"];

  // Collect request body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      // Skip hop-by-hop headers Vercel sets itself
      if (["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    // Add permissive CORS so the browser never complains again
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    res.status(502).json({ success: false, error: { code: "PROXY_ERROR", message: String(err) } });
  }
}
