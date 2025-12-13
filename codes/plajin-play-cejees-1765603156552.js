/**
 *Author  : ~ v.d (remake untuk style sock)
 *Note    : include ffmpeg convert to opus
 */

const axios = require('axios')
const yts = require('yt-search')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const sampahDir = './data/sampah'  

async function convertToPTT(buffer, filename = 'audio.mp3') {
    return new Promise((resolve, reject) => {
        try {

            const inPath = path.join(sampahDir, `${Date.now()}-${filename}`)
            const outPath = path.join(sampahDir, `${Date.now()}-convert.opus`)

            fs.writeFileSync(inPath, buffer)

            const cmd = `ffmpeg -y -i "${inPath}" -c:a libopus -b:a 128k -vn "${outPath}"`

            exec(cmd, (err) => {
                fs.unlinkSync(inPath)
                if (err) return reject(err)

                const result = fs.readFileSync(outPath)
                fs.unlinkSync(outPath)

                resolve(result)
            })
        } catch (e) {
            reject(e)
        }
    })
}

let handler = async (m, sock, { reply, prefix, command, example, react }) => {

    try {
        let text = m.text.split(" ").slice(1).join(" ")
        if (!text) return reply(example(`judul lagunya?`))

        react()

        let search = await yts(text)
        if (!search.videos.length) {
            return reply(`lagu tidak ditemukan.`)
        }

        let vid = search.videos[0]

        const apiUrl = `https://host.optikl.ink/download/youtube?url=${encodeURIComponent(vid.url)}&format=mp3`
        const { data } = await axios.get(apiUrl)

        if (!data.result?.download) {
            return reply(`audio tidak tersedia.`)
        }

        let res = data.result

        let mp3 = (
            await axios.get(res.download, { responseType: 'arraybuffer' })
        ).data

        let opus = await convertToPTT(mp3)

        await sock.sendMessage(
            m.chat,
            {
                audio: opus,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                waveform: [20,100,20,100,20,100,20,100],
                contextInfo: {
                    externalAdReply: {
                        title: res.title.slice(0, 30),
                        body: vid.author?.name || "YouTube",
                        thumbnailUrl: vid.thumbnail,
                        sourceUrl: vid.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: m }
        )

    } catch (e) {
        console.log(e)
        reply(`gagal proses.`)
    }
}

handler.command = ["play", "song", "lagu"]
module.exports = handler