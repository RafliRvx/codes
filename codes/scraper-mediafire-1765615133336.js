async function mediafireDownload(url) {
    try {        
        if (!url.includes('mediafire.com')) {
            return { success: false, message: "invalid_url" };
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = await response.text();
      
        const downloadLinkMatch = html.match(/https?:\/\/download[0-9]*\.mediafire\.com\/[^"']*/);
        if (!downloadLinkMatch) {
            const alternativeMatch = html.match(/("downloadUrl":")([^"]*)"/);
            if (alternativeMatch) {
                var downloadLink = alternativeMatch[2].replace(/\\u0026/g, '&');
            } else {
                return { success: false, message: "no_download_link" };
            }
        } else {
            var downloadLink = downloadLinkMatch[0];
        }

        const fileNameMatch = html.match(/<div class="filename">([^<]*)<\/div>/);
        const fileSizeMatch = html.match(/<div class="file-size">([^<]*)<\/div>/);
        
        const fileName = fileNameMatch ? fileNameMatch[1].trim() : 'Unknown';
        const fileSize = fileSizeMatch ? fileSizeMatch[1].trim() : 'Unknown';

        return {
            success: true,
            downloadUrl: downloadLink,
            fileName: fileName,
            fileSize: fileSize,
            originalUrl: url
        };

    } catch (error) {
        console.log('MediaFire error:', error);
        return { success: false, message: "error", error: error.message };
    }
}
