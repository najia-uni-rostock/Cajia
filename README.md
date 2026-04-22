# Getting Started with Create Next App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Installation

Clone this repository into a directory on your computer.
In the local project directory, open a console and run
```bash
npm install
```

This will create a `node_modules` folder inside the project directory where all the project dependencies are installed. You need to re-run the command whenever you add or remove dependencies manually in the `package.json`.

Run

```bash
npm run dev
```

to start the application in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. 

You can start editing your project page by modifying `src/app/project/page.tsx`. The page in the browser auto-updates as you make changes to the code.

## Code of Conduct

For your project to be integrated into the final visualization atlas, it should meet the following requirements:
- Your entire project implementation stays inside the parent container provided under `src/app/project/`. When needed, you might add assets like data, etc. to higher leves of the project hierarchy, though.
- All dependencies are managed locally in the `package.json` (no `<script>` or `<style>` tags).
- The project is deployable as a standalone website. Please do not use external server components. If you absolutely cannot do without, speak to me first!
- The project uses a `.gitignore` file to control what get's pushed to the upstream repository.

## Learn More

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
