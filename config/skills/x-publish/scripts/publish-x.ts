import { createHmac, randomBytes } from "node:crypto"
import { stdin } from "node:process"

const endpoint = "https://api.x.com/2/tweets"

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

function createAuthHeader() {
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

async function main() {
  const text = (process.argv.slice(2).join(" ") || await readStdin()).trim()
  if (!text) throw new Error("Missing post text")

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: createAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(`X API error ${response.status}: ${body}`)
  }

  const json = JSON.parse(body) as { data: { id: string } }
  console.log(`https://x.com/i/web/status/${json.data.id}`)
}

main()
