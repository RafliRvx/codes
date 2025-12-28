const axios = require("axios")
const qs = require("querystring")
const crypto = require("crypto")

function pick(arr, n) {
  return arr.sort(() => Math.random() - 0.5).slice(0, n)
}

async function run() {
  const limit = Number(process.argv[2]) || 4

  await axios.post(
    "https://c.pub.network/v2/c",
    {
      messageId: crypto.randomUUID(),
      pageId: "2c3802f7e3eb3cdeecaa145a254c0ac4",
      url: "https://codebeautify.org/random-anime-character-generator",
      userAgent: "Mozilla/5.0",
      pageviewCount: 1,
      accountId: 2073,
      siteId: 5956,
      deploymentId: "5c6b2962-b79b-4b00-9dee-5d75ee08a086",
      templateVersionId: "71ebc37c2933dc2904f59f501f5be1a19cd8e02e",
      testName: null,
      testGroup: 0,
      testVariantId: null,
      sessionId: crypto.randomUUID(),
      dfpResponse: []
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    }
  )

  const { data } = await axios.post(
    "https://codebeautify.org/randomData",
    qs.stringify({ type: "anime-character" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      }
    }
  )

  const result = pick(data, limit).map(v => ({
    name: v.name,
    image: "https://codebeautify.org" + v.image
  }))

  console.log(JSON.stringify({
    success: true,
    total: result.length,
    results: result
  }, null, 2))
}

run().catch(e => {
  console.log(JSON.stringify({
    success: false,
    message: e.message
  }, null, 2))
})

// contoh
node randomnime.js 2 
2 > jumlah