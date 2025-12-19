const axios = require('axios');

const BASE = 'https://p.savenow.to';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getMeta(url) {
 const { data } = await axios.get(
 'https://www.youtube.com/oembed',
 { params: { url, format: 'json' } }
 );
 return {
 title: data.title,
 channel: data.author_name,
 thumbnail: data.thumbnail_url
 };
}

function formatInfo(f) {
 if (['mp3','m4a','aac','flac','ogg','opus','wav'].includes(f)) return { ext: f, quality: 'audio' };
 if (f === 'webm_audio') return { ext: 'webm', quality: 'audio' };
 if (f === '4k') return { ext: 'mp4', quality: '4K' };
 if (f === '8k') return { ext: 'mp4', quality: '8K' };
 return { ext: 'mp4', quality: f + 'p' };
}

async function savenow(url, format = '720') {
 const meta = await getMeta(url);

 const init = await axios.get(`${BASE}/ajax/download.php`, {
 params: { button: 1, start: 1, end: 1, format, iframe_source: 'direct', url }
 });

 const id = init.data?.id;
 if (!id) throw 'Init failed';

 while (true) {
 await sleep(1500);
 const { data } = await axios.get(`${BASE}/api/progress`, { params: { id } });

 if (data.download_url && data.success == 1) {
 const info = formatInfo(format);
 return {
 video: {
 url,
 title: meta.title,
 channel: meta.channel,
 thumbnail: meta.thumbnail
 },
 download: {
 url: data.download_url,
 ext: info.ext,
 quality: info.quality,
 alternatives: (data.alternative_download_urls||[]).map(v => v.url)
 }
 };
 }

 if (data.success == 1 && !data.download_url) throw 'Conversion error';
 }
}