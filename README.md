# Fundraising Platform

A simple GoFundMe-style fundraising platform built with Next.js, Prisma, and PostgreSQL.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

Create a `.env` file with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
AUTH_SECRET="a-long-random-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

4. Start the dev server:

```bash
npm run dev
```

## Available scripts

- `npm run dev` – start Next.js dev server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run lint` – run ESLint
- `npm run test` – run Vitest test suite

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
