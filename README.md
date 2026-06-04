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

## Paso 4

Añadimos una skill:

```txt
~/.config/agente-bolsillo/skills/x-publish/SKILL.md
```

- Pi descubre skills desde la carpeta de configuración del agente.
- La skill explica cómo publicar en X usando un script propio.
- El bot puede convertir una petición de Telegram en una acción fuera del chat.

## Paso 5

Añadimos soporte para imágenes:

- Telegram descarga la foto a `~/.config/agente-bolsillo/uploads`.
- El agente recibe la ruta local de la imagen.
- La skill puede publicar en X con texto e imagen.

## Paso 6

Añadimos memoria:

```txt
~/.config/agente-bolsillo/MEMORY.md
```

- El bot carga la memoria como contexto.
- `AGENTS.md` explica cuándo merece la pena guardarla.
- Cada turno lee la versión actual del archivo.

## Paso 7

Añadimos approvals:

- Publicar en X se considera una acción externa.
- Si el mensaje no empieza por `Confirmo`, el bot no delega en Pi.
- La frontera vive en el arnés, no en la buena voluntad del modelo.

## Comandos

```bash
pnpm install
cp .env.example .env
pnpm bot
```
