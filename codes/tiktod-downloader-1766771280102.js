const axios = require('axios')
const cheerio = require('cheerio')

async function ttsave(url) {
  const endpoint = 'https://ttsave.app/download'

  const { data: html } = await axios.post(
    endpoint,
    {
      query: url,
      language_id: '2'
    },
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'origin': 'https://ttsave.app',
        'referer': 'https://ttsave.app/id'
      }
    }
  )

  const $ = cheerio.load(html)

  const result = {
    id: $('#unique-id').val() || null,
    video: {},
    audio: null,
    cover: null,
    profile: null
  }

  $('a[onclick="bdl(this, event)"]').each((_, el) => {
    const type = $(el).attr('type')
    const href = $(el).attr('href')

    if (!href) return

    if (type === 'no-watermark') {
      result.video.no_watermark = href
    } else if (type === 'watermark') {
      result.video.watermark = href
    } else if (type === 'audio') {
      result.audio = href
    } else if (type === 'cover') {
      result.cover = href
    } else if (type === 'profile') {
      result.profile = href
    }
  })

  return result
}

// contoh
;(async () => {
  const url = 'https://vt.tiktok.com/ZSPobhBBT/'
  const res = await ttsave(url)
  console.log(JSON.stringify(res, null, 2))
})()