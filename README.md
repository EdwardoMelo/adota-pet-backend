# AdotaPet — API (NestJS + Prisma)

Backend REST. Exige PostgreSQL e variáveis em `.env` (veja `.env.example`).

## Comandos

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

A API default sobe em `http://localhost:3000` (ajustável com `PORT`).

## Deploy de produção (VPS)

Com variáveis de VPS configuradas no `.env`, execute:

```bash
npm run deploy-production
```

O script conecta por SSH e roda, nessa ordem: `git pull`, `npx prisma generate`, `npm run build`, `pm2 restart` e `pm2 save`.
