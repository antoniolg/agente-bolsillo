# Agente bolsillo

Ejercicio paso a paso para la charla **Un agente en tu bolsillo**.

La historia del repo se construye commit a commit. Cada commit añade una pieza del arnés.

## Paso 1

Bot mínimo con Pi:

- Telegram recibe el mensaje.
- Pi ejecuta el turno.
- El bot responde.

## Paso 2

Añadimos `SOUL.md` en la configuración del usuario:

```txt
~/.config/agente-bolsillo/SOUL.md
```

- El bot mantiene la misma arquitectura.
- Pi recibe instrucciones de personalidad al arrancar la sesión.
- La sesión trabaja desde la carpeta del agente, no desde el repo del runtime.

## Paso 3

Añadimos `USER.md` y `AGENTS.md`:

```txt
~/.config/agente-bolsillo/USER.md
~/.config/agente-bolsillo/AGENTS.md
```

- `USER.md` describe para quién trabaja.
- `AGENTS.md` describe las reglas del canal.
- El runtime carga más contexto sin cambiar la conversación de Telegram.
- En `config/` tienes una copia de referencia para preparar esa carpeta.

## Comandos

```bash
pnpm install
cp .env.example .env
pnpm bot
```
