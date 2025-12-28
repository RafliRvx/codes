const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

// ===============================
// Eporner Scraper (HTML Parser)
// ===============================
async function scrapeEporner(videoUrl) {
    try {
        const { data: html } = await axios.get(videoUrl, {
            headers: {
                "Accept": "text/html",
                "Accept-Language": "id-ID,id;q=0.9",
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
            },
            timeout: 20000
        });

        const $ = cheerio.load(html);
        const base = new URL(videoUrl).origin;

        const downloads = [];

        // ===============================
        // PARSE DOWNLOAD LINKS
        // ===============================
        $("span.download-h264 a").each((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();

            if (href) {
                downloads.push({
                    label: text,
                    url: href.startsWith("http") ? href : base + href
                });
            }
        });

        // ===============================
        // OPTIONAL: BASIC INFO
        // ===============================
        const title =
            $("h1").first().text().trim() ||
            $("title").text().trim();

        const result = {
            success: downloads.length > 0,
            title,
            downloads
        };

        console.log("===== Scraper Response =====");
        console.log(JSON.stringify(result, null, 4));

        return result;

    } catch (err) {
        console.error(
            "Scraper Error:",
            err.response?.status,
            err.message
        );
    }
}

// ===============================
// CONTOH PEMAKAIAN
// ===============================
scrapeEporner(
    "https://www.eporner.com/video-k6pubczsnRj/sex-for-money-andini-permata-full-https-linktr-ee-bookingpsk/"
);