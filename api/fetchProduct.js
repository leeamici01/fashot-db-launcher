export default async function handler(req, res) {
  const cheerio = require("cheerio");
  const fetch = require("node-fetch");

  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const duckURL = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const searchRes = await fetch(duckURL);
    const searchHTML = await searchRes.text();
    const $ = cheerio.load(searchHTML);

    const links = [];
    $("a.result__a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.includes("duckduckgo")) links.push(href);
    });

    const firstLink = links.find(link =>
      link.includes(".com") &&
      !link.includes("amazon") &&
      !link.includes("ebay") &&
      !link.includes("zappos")
    );

    if (!firstLink) return res.status(404).json({ error: "No brand site found." });

    const productRes = await fetch(firstLink);
    const productHTML = await productRes.text();
    const $$ = cheerio.load(productHTML);

    const title = $$("h1").first().text().trim();
    const description = $$("p").first().text().trim();
    const price =
      $$("[class*='price'], .product-price, .price-tag").first().text().trim() || "Price not found";

    return res.status(200).json({
      title: title || "Title not found",
      price,
      description: description || "Description not found",
      url: firstLink
    });
  } catch (err) {
    return res.status(500).json({ error: "Scrape failed", detail: err.message });
  }
}
