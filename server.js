
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Allow only specific public websites.
const ALLOWED_HOSTS = new Set([
  "example.com",
  "www.example.com",
  "duckduckgo.com",
  "html.duckduckgo.com"
]);

app.get("/", (req, res) => {
  res.send("ZERO-GX proxy server is running.");
});

app.get("/proxy", async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).send("Add a URL to proxy.");
    }

    const target = new URL(rawUrl);

    if (
      target.protocol !== "https:" ||
      !ALLOWED_HOSTS.has(target.hostname)
    ) {
      return res.status(403).send(
        "This destination is not allowed by this starter proxy."
      );
    }

    const response = await fetch(target, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Zero-GX/1.0"
      }
    });

    res.status(response.status);
    res.set("Content-Type",
      response.headers.get("content-type") || "text/plain");
    res.set("X-Content-Type-Options", "nosniff");

    res.send(await response.text());
  } catch (error) {
    res.status(502).send("Unable to reach that website.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zero-GX server running on port ${PORT}`);
});
