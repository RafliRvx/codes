const axios = require("axios")
const crypto = require("crypto")

const BASE = "https://tinywow.com"

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function initSession() {
  const res = await axios.get(BASE + "/image/ai-image-generator", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html"
    }
  })

  const cookies = res.headers["set-cookie"] || []

  const cookieStr = cookies.map(v => v.split(";")[0]).join("; ")

  const xsrfRaw = cookies.find(v => v.startsWith("XSRF-TOKEN="))
  const xsrf = decodeURIComponent(xsrfRaw.split("=")[1].split(";")[0])

  return { cookie: cookieStr, xsrf }
}

async function prepare(prompt, session) {
  const res = await axios.post(
    BASE + "/image/prepare",
    {
      prompt,
      mode: "ai_image_generator",
      step: 1,
      is_ws: false,
      ws_id: crypto.randomUUID()
    },
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=utf-8",
        "X-XSRF-TOKEN": session.xsrf,
        "Cookie": session.cookie
      }
    }
  )
  return res.data.task_id
}

async function progress(taskId, session) {
  const res = await axios.post(
    BASE + `/task/progress/${taskId}`,
    {},
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=utf-8",
        "X-XSRF-TOKEN": session.xsrf,
        "Cookie": session.cookie
      }
    }
  )
  return res.data
}

// contoh
;(async () => {
  const prompt = process.argv.slice(2).join(" ") || "landscape aesthetic"

  const session = await initSession()
  const taskId = await prepare(prompt, session)

  let result
  while (true) {
    await sleep(3000)
    result = await progress(taskId, session)
    if (result.state === "completed") break
  }

  console.log({
    task_id: taskId,
    download_url: result.download_url,
    images: result.images
  })
})()