import puppeteer from "puppeteer";

// Function to scrape financial news
export const scrapeNews = async () => {
  const url = "https://www.google.com/finance/?hl=en";

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: "domcontentloaded",
      timeout: 30000 
    });

    // Scrape news headlines and hyperlinks
    const newsData = await page.evaluate(() => {
      const newsItems = [];
      const elements = document.querySelectorAll(".Yfwt5"); // Adjust selector if necessary

      elements.forEach((element) => {
        const headline = element.textContent.trim();
        const linkElement = element.closest("a"); // Get closest parent `<a>` tag
        const hyperlink = linkElement ? linkElement.href : null;

        if (headline && hyperlink) {
          newsItems.push({ 
            headline, 
            hyperlink,
            timestamp: new Date().toISOString()
          });
        }
      });

      return newsItems;
    });

    console.log(`Scraped ${newsData.length} news items successfully`);
    return newsData;

  } catch (error) {
    console.error("Error scraping news data:", error);
    throw new Error(`News scraping failed: ${error.message}`);
  } finally {
    // Close the browser
    await browser.close();
  }
};

export default { scrapeNews };
