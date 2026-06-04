import { createHmac, randomBytes } from "node:crypto"
import { readFile } from "node:fs/promises"
import { basename, extname } from "node:path"
import { stdin } from "node:process"

const tweetEndpoint = "https://api.x.com/2/tweets"
const uploadEndpoint = "https://upload.twitter.com/1.1/media/upload.json"

function encode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

async function readStdin() {
  if (stdin.isTTY) return ""

  let input = ""
  for await (const chunk of stdin) {
    input += chunk
  }
  return input
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function createAuthHeader(endpoint: string) {
  const apiKey = requireEnv("X_API_KEY")
  const apiSecret = requireEnv("X_API_SECRET")
  const accessToken = requireEnv("X_ACCESS_TOKEN")
  const accessSecret = requireEnv("X_ACCESS_TOKEN_SECRET")

  const oauth = {
    oauth_consumer_key: apiKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  }

  const parameterString = Object.entries(oauth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join("&")

  const signatureBase = ["POST", encode(endpoint), encode(parameterString)].join("&")
  const signingKey = `${encode(apiSecret)}&${encode(accessSecret)}`
  const oauth_signature = createHmac("sha1", signingKey).update(signatureBase).digest("base64")

  return (
    "OAuth " +
    Object.entries({ ...oauth, oauth_signature })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${encode(key)}="${encode(value)}"`)
      .join(", ")
  )
}

function contentTypeFor(path: string) {
  const extension = extname(path).toLowerCase()
  if (extension === ".png") return "image/png"
  if (extension === ".webp") return "image/webp"
  return "image/jpeg"
}

async function uploadImage(path: string) {
  const file = await readFile(path)
  const form = new FormData()
  form.append("media", new Blob([file as unknown as BlobPart], { type: contentTypeFor(path) }), basename(path))

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: { Authorization: createAuthHeader(uploadEndpoint) },
    body: form,
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`X media upload error ${response.status}: ${body}`)
  }

  return (JSON.parse(body) as { media_id_string: string }).media_id_string
}

function parseArgs() {
  const args = process.argv.slice(2)
  const text: string[] = []
  let imagePath: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--image") {
      imagePath = args[++i]
    } else {
      text.push(args[i])
    }
  }

  return { imagePath, text: text.join(" ") }
}

async function main() {
  const args = parseArgs()
  const text = (args.text || await readStdin()).trim()
  if (!text) throw new Error("Missing post text")
  const mediaId = args.imagePath ? await uploadImage(args.imagePath) : undefined

  const response = await fetch(tweetEndpoint, {
    method: "POST",
    headers: {
      Authorization: createAuthHeader(tweetEndpoint),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    }),
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`X API error ${response.status}: ${body}`)
  }

  const json = JSON.parse(body) as { data: { id: string } }
  console.log(`https://x.com/i/web/status/${json.data.id}`)
}

main()
