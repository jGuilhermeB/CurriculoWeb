# Landing page — Currículo (Guilherme Barroso)

## Como rodar (React + Vite)

- Instale dependências:
  - `npm install`
- Rode localmente:
  - `npm run dev:full` (front + servidor de e-mail)

## PDF

- **Botão**: “Baixar PDF” na seção principal.
- **Atalho**: `Ctrl + Shift + P` baixa o PDF.
- **Console**: chame `window.generateLandingPdf({ silent: false })`.

## Envio de e-mail (real)

O envio funciona via um pequeno servidor local (`server/index.js`) que envia e-mail por SMTP.

- Copie `.env.example` para `.env` e preencha:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`
- Rode:
  - `npm run dev:full`


