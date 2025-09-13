export default async function handler(req, res) {
  const cheerio = require("cheerio");
  const fetch = require("node-fetch");

  // ✅ Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const duckURL = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const fallbackGoogleURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  try {
    // Step 1: Try DuckDuckGo
    const searchRes = await fetch(duckURL);
    const searchHTML = await searchRes.text();
    const $ = cheerio.load(searchHTML);

    const links = [];
    $("a.result__a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.includes("duckduckgo")) links.push(href);
    });

    // Step 2: Fallback to Google if no clean links
    if (links.length === 0) {
      console.warn("DuckDuckGo failed, trying Google");
      const fallbackRes = await fetch(fallbackGoogleURL);
      const fallbackHTML = await fallbackRes.text();
      const _$ = cheerio.load(fallbackHTML);

      _$("a").each((_, el) => {
        const href = _$(el).attr("href");
        if (href && href.startsWith("http") && !href.includes("google.com")) {
          links.push(href);
        }
      });
    }

    const firstLink = links.find(link =>
      link.includes(".com") &&
      !link.includes("amazon") &&
      !link.includes("ebay") &&
      !link.includes("zappos")
    );

    if (!firstLink) {
      return res.status(404).json({ error: "No product site found from DuckDuckGo or Google." });
    }

    // Step 3: Fetch the product page
    const productRes = await fetch(firstLink);
    const productHTML = await productRes.text();
    const $$ = cheerio.load(productHTML);

    const title = $$("h1").first().text().trim() || "Title not found";
    const description = $$("p").first().text().trim() || "Description not found";
    const price = $$("[class*=price], .product-price, .price-tag").first().text().trim() || "Price not found";

    return res.status(200).json({
      title,
      description,
      price,
      url: firstLink
    });

  } catch (err) {
    console.error("Scrape error:", err.message);
    return res.status(500).json({
      error: "Scrape failed",
      detail: err.message
    });
  }
}

