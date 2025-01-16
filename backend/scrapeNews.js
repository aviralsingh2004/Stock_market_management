import puppeteer from "puppeteer"; // Ensure to use ES Module support or `type: "module"` in package.json

const scrapeNews = async () => {
  const url = "https://www.google.com/finance/?hl=en";

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Scrape news headlines and hyperlinks
    const newsData = await page.evaluate(() => {
      const newsItems = [];
      const elements = document.querySelectorAll(".Yfwt5");

      elements.forEach((element) => {
        const headline = element.textContent.trim();
        console.log(headline);
        const linkElement = element.closest("a"); // Get closest parent `<a>` tag
        const hyperlink = linkElement ? linkElement.href : null;

        if (headline && hyperlink) {
          newsItems.push({ headline, hyperlink });
        }
      });

      return newsItems;
    });

    // Display the extracted data in JSON format on the console
    console.log(JSON.stringify(newsData));
  } catch (error) {
    console.error("Error scraping the data:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
};

// Execute the function
scrapeNews();
