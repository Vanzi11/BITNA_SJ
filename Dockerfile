# Backend Bitna Saju (Fase 5) — Node (server.mjs, sem dependencias externas)
# + Python (geracao de PDF via reportlab/pypdf) no mesmo container.
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /repo

# Motor de calculo (fortuneteller) - build TypeScript
COPY fortuneteller/package.json fortuneteller/package-lock.json fortuneteller/
RUN cd fortuneteller && npm ci
COPY fortuneteller/ fortuneteller/
RUN cd fortuneteller && npm run build

# Dependencias Python dos geradores de PDF
COPY app/pdf/ app/pdf/
RUN pip install --break-system-packages --no-cache-dir reportlab pypdf

# Backend HTTP + prompts
COPY app/ app/
COPY relatorios/prompts/ relatorios/prompts/

ENV NODE_ENV=production
EXPOSE 3333

CMD ["node", "--env-file-if-exists=app/.env", "app/server.mjs"]
