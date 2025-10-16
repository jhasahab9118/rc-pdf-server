const express = require("express");
const puppeteer = require("puppeteer");

const cors = require("cors");
app.use(cors());

app.post("/generate", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).send("Missing HTML content");

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
