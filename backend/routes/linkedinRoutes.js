const express = require("express");
const multer = require("multer");
const PDFParser = require("pdf2json");
const puppeteer = require("puppeteer");
const axios = require("axios");
const auth = require("../middleware/auth");

// Import LinkedInAnalysis schema (not used directly, kept for reference)
const LinkedInAnalysisSchema = require("../models/linkedinAnalysis");

module.exports = (LinkedInAnalysis) => {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  // PDF Upload Endpoint
  router.post("/upload-linkedin-pdf", auth, upload.single("pdf"), async (req, res) => {
    try {
      const { jobDescription } = req.body;
      if (!req.file || !jobDescription) {
        return res.status(400).json({ error: "PDF and job description are required." });
      }

      const pdfParser = new PDFParser();
      pdfParser.on("pdfParser_dataError", (errData) => {
        throw new Error("PDF Parsing Error: " + errData.parserError);
      });
      pdfParser.on("pdfParser_dataReady", async (pdfData) => {
        const profileText = pdfData.Pages.map((page) =>
          page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
        )
          .join("\n")
          .trim()
          .replace(/\n\s*\n/g, "\n");
        const analysis = await analyzeWithGemini(profileText, jobDescription);
        const linkedinAnalysis = new LinkedInAnalysis({
          userId: req.user.userId,
          jobDescription,
          analysis,
        });
        await linkedinAnalysis.save();
        res.json(analysis);
      });
      pdfParser.parseBuffer(req.file.buffer);
    } catch (error) {
      console.error("PDF analysis error:", error);
      res.status(500).json({ error: "Failed to analyze LinkedIn profile." });
    }
  });

  // URL Scraping Endpoint
  router.post("/check-linkedin", auth, async (req, res) => {
    const { url, jobDescription } = req.body;
    if (!url || !jobDescription) {
      return res.status(400).json({ error: "URL and job description are required." });
    }

    try {
      const profileText = await fetchLinkedInProfile(url);
      const analysis = await analyzeWithGemini(profileText, jobDescription);
      const linkedinAnalysis = new LinkedInAnalysis({
        userId: req.user.userId,
        jobDescription,
        profileUrl: url,
        analysis,
      });
      await linkedinAnalysis.save();
      res.json(analysis);
    } catch (error) {
      console.error("URL analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze LinkedIn URL." });
    }
  });

  // Scrape LinkedIn Profile
  async function fetchLinkedInProfile(url) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForSelector(".pv-top-card", { timeout: 10000 }).catch(() => {
        throw new Error("Profile content not found. Ensure the profile is public.");
      });

      const profileText = await page.evaluate(() => {
        const sections = [
          ".pv-top-card",
          ".pv-profile-section.experience-section",
          ".pv-profile-section.education-section",
          ".pv-profile-section.skills-section",
        ];
        let text = "";
        sections.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            text += el.innerText + "\n";
          });
        });
        return text.trim();
      });

      if (!profileText) {
        throw new Error("No content extracted from the profile.");
      }

      return profileText;
    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  // Placeholder for analyzeWithGemini (to be defined in server.js)
  async function analyzeWithGemini(profileText, jobDescription) {
    throw new Error("analyzeWithGemini function not implemented. Check server.js for the definition.");
  }

  return router;
};