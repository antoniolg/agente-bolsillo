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

## Comandos

```bash
pnpm install
cp .env.example .env
pnpm bot
```
