import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { Bot } from "grammy"
import { createAgentSession, DefaultResourceLoader, SessionManager } from "@earendil-works/pi-coding-agent"
import { saveTelegramPhoto } from "./telegram-files.js"

const telegramToken = process.env.TELEGRAM_TOKEN!
const bot = new Bot(telegramToken)
const agentDir = join(homedir(), ".config", "agente-bolsillo")
const skillsDir = join(agentDir, "skills")
const uploadsDir = join(agentDir, "uploads")
const soul = await readFile(join(agentDir, "SOUL.md"), "utf8")
const user = await readFile(join(agentDir, "USER.md"), "utf8")
const agents = await readFile(join(agentDir, "AGENTS.md"), "utf8")

const loader = new DefaultResourceLoader({
  cwd: agentDir,
  agentDir,
  skillsOverride: ({ skills, diagnostics }) => ({
    skills: skills.filter((skill) => skill.filePath.startsWith(skillsDir)),
    diagnostics,
  }),
  appendSystemPromptOverride: (base) => [...base, soul, user, agents],
})
await loader.reload()

const { session } = await createAgentSession({
  cwd: agentDir,
  resourceLoader: loader,
  sessionManager: SessionManager.inMemory(agentDir),
})

async function askPi(message: string) {
  let text = ""
  const unsubscribe = session.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      text += event.assistantMessageEvent.delta
    }
  })

  await session.prompt(message)
  unsubscribe()
  return text.trim()
}

bot.on("message:text", async (ctx) => {
  const answer = await askPi(ctx.message.text)
  await ctx.reply(answer)
})

bot.on("message:photo", async (ctx) => {
  const photo = ctx.message.photo.at(-1)!
  const imagePath = await saveTelegramPhoto(bot, telegramToken, photo.file_id, uploadsDir)
  const caption = ctx.message.caption ?? "Antonio ha enviado una imagen."
  const answer = await askPi(`${caption}\n\nImagen local: ${imagePath}`)
  await ctx.reply(answer)
})

bot.start()
