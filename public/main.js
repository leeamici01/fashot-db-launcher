document.getElementById("generate").addEventListener("click", async () => {
  const input = document.querySelector("textarea").value;
  const output = document.getElementById("output");
  output.textContent = "⏳ Generating...";

  try {
    // First: Try to fetch extra product data via DuckDuckGo
    const ragRes = await fetch("/api/fetchProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: input })
    });

    let ragData = null;

    if (ragRes.ok) {
      ragData = await ragRes.json();
    }

    // Second: Send structured prompt to GPT
    const gptRes = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: input,
        context: ragData
      })
    });

    const gptJson = await gptRes.json();

    output.textContent = gptJson.result || "⚠️ No result returned.";
  } catch (err) {
    output.textContent = "❌ Error: " + err.message;
  }
});

// Optional: PDF export button
document.getElementById("export").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  const blob = new Blob([text], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "description.pdf";
  link.click();
});

// Optional: Save .txt file
document.getElementById("trace").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "text_output.txt";
  link.click();
});
