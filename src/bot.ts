import { Bot } from "grammy"
import { createAgentSession } from "@earendil-works/pi-coding-agent"

const bot = new Bot(process.env.TELEGRAM_TOKEN!)
const { session } = await createAgentSession({ cwd: process.cwd() })

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
