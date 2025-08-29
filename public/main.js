async function generate() {
  const prompt = document.getElementById("prompt").value;
  const output = document.getElementById("output");
  output.textContent = "⏳ Generating...";
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const json = await res.json();
    output.textContent = json.result || "❌ No result.";
  } catch (e) {
    output.textContent = "❌ Error: " + e.message;
  }
}

function exportPDF() {
  const content = document.getElementById("output").textContent;
  const blob = new Blob([content], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "db_text_writer_output.pdf";
  link.click();
}

function downloadTrace() {
  const trace = `Prompt:\n${document.getElementById("prompt").value}\n\nOutput:\n${document.getElementById("output").textContent}`;
  const blob = new Blob([trace], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "legal_trace.txt";
  link.click();
}