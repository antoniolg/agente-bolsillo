import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { Bot } from "grammy"
import { createAgentSession, DefaultResourceLoader, SessionManager } from "@earendil-works/pi-coding-agent"

const bot = new Bot(process.env.TELEGRAM_TOKEN!)
const agentDir = join(homedir(), ".config", "agente-bolsillo")
const soul = await readFile(join(agentDir, "SOUL.md"), "utf8")
const user = await readFile(join(agentDir, "USER.md"), "utf8")
const agents = await readFile(join(agentDir, "AGENTS.md"), "utf8")

const loader = new DefaultResourceLoader({
  cwd: agentDir,
  agentDir,
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

bot.start()
