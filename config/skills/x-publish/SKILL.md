---
name: x-publish
description: Publish short text posts to X/Twitter for Antonio using the bundled script and X API credentials. Use when Antonio asks to publish, post, or tweet something on X.
---

# X Publish

Use this skill when Antonio asks to publish a text post on X.

## Requirements

The environment must include:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

## Workflow

1. Draft a short post in Spanish unless Antonio asks for another language.
2. Keep it direct and natural. Do not add hashtags unless Antonio asks.
3. Publish without asking for confirmation.
4. Run the bundled script from this skill directory:

```bash
pnpm --dir /Users/antonio/Projects/antoniolg/agente-bolsillo exec tsx /Users/antonio/.config/agente-bolsillo/skills/x-publish/scripts/publish-x.ts "post text"
```

If the text has several lines, pipe it through stdin:

```bash
printf '%s' "post text" | pnpm --dir /Users/antonio/Projects/antoniolg/agente-bolsillo exec tsx /Users/antonio/.config/agente-bolsillo/skills/x-publish/scripts/publish-x.ts
```

5. Return the URL printed by the script.
