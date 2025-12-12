const fetch = require("node-fetch")

let handler = async(m, sock, { reply, prefix, command, args, react, example }) => {

    if (!args[0]) return reply(example(`https://wa.me/channel/message 😄`))
    if (!args[1]) return reply(`Silakan masukkan emoji\nContoh:\n${prefix+command} link 😄🤣 atau 😄,🤣,😘`)

    react()

    try {
        const link = args[0]

        let rawEmoji = args.slice(1).join(" ")
        let emojiList = rawEmoji
            .replace(/,/g, " ") 
            .split(/\s+/)
            .filter(v => v.trim())  

        if (emojiList.length < 1) return reply(`Minimal 1 emoji diperlukan.`)

        const emojis = emojiList.join(" ")

        const ENCODED_LINK_CH = encodeURIComponent(link)
        const ENCODED_EMOJI = encodeURIComponent(emojis)

        const headers = {
            "x-api-key": "ENRIQUE"
        }

        const url = `https://react.whyux-xec.my.id/api/rch?link=${ENCODED_LINK_CH}&emoji=${ENCODED_EMOJI}`
        
        const response = await fetch(url, { method: "GET", headers })
        const raw = await response.text()

        let result
        try {
            result = JSON.parse(raw)
        } catch {
            console.log(`RAW RESPONSE:`, raw)
            return reply(`Terjadi kesalahan saat memproses API.`)
        }

        if (result?.success === true) {
            reply(`Reaksi berhasil dikirim ke pesan channel.\nJumlah Emoji: ${emojiList.length}\nEmoji: ${emojis}`)
        } else {
            reply(result?.error || `Gagal mengirim reaksi.`)
        }

    } catch (err) {
        console.error(`FETCH ERROR:`, err)
        reply(`Server API tidak dapat diakses saat ini, silakan coba kembali.`)
    }
}

handler.command = ["rch", "reactch"]
module.exports = handler