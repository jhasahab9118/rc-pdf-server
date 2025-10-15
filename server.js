import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Helper: replace placeholders {{FieldName}} with actual values
function fillTemplate(html, data) {
  let out = html;
  for (const [key, val] of Object.entries(data)) {
    const safe = (val ?? "").toString();
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), safe);
  }
  // Remove any leftover placeholders
  out = out.replace(/\{\{[A-Za-z0-9_]+\}\}/g, "");
  return out;
}

// API route to generate PDF
app.post("/generate-rc", async (req, res) => {
  try {
    const details = req.body;
    const tplPath = path.join(__dirname, "rc_template.html");
    const html = fs.readFileSync(tplPath, "utf8");
    const filled = fillTemplate(html, details);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(filled, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" }
    });

    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=RC_Certificate.pdf");
    return res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "PDF generation failed" });
  }
});

// Simple test route
app.get("/", (_req, res) => res.send("RC PDF Generator API OK"));

// ✅ Port setup (local + hosting platforms like Render/Railway)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
