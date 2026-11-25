# CLAUDE.md

Workshop materials (Thai) for "การพัฒนาระบบอัตโนมัติ" — Claude Code + Docker + GitHub, Node-RED, n8n, and an AI agent app.

## Commands
- Whole stack: `docker compose up -d` · logs: `docker compose logs -f <service>` · rebuild app: `docker compose up -d --build agent-app`
- Agent app locally: `cd apps/agent-app && npm install && npm start` (needs `ANTHROPIC_API_KEY`)

## Conventions
- Docs and UI text are Thai; code identifiers and comments in code are English.
- Services talk to each other by compose service name (`http://n8n:5678`, `http://node-red:1880`), never `localhost`.
- Secrets live only in `.env` (gitignored). Add new variables to `.env.example` with an empty value.
- Default model is `claude-opus-5-5`, read from `CLAUDE_MODEL`. Don't hard-code another model.
- Agent tools in `apps/agent-app/tools.js` use `strict: true` schemas: every property listed in `required`, `additionalProperties: false`.
- Node-RED flows and n8n workflows are kept as exported JSON under `labs/` — re-export after changing them in the UI.
