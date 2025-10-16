const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

// PDF Generate Endpoint
app.post("/generate", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).send("Missing HTML content");
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new"
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=certificate.pdf"
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF Generation Error:", err);
    res.status(500).send("Error generating PDF");
  }
});

// Railway Port Binding
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
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
    console.error("PDF generation error:", e);
    return res.status(500).json({ error: "PDF generation failed" });
  }
});

// Simple test route
app.get("/", (_req, res) => res.send("RC PDF Generator API OK"));

// ✅ Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
