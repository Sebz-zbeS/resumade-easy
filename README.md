# Resumade Easy

AI-powered resume customization — paste your resume + a job description, and Claude tailors every section automatically.

## Features
- Paste resume as text OR upload a PDF
- Paste any job description
- Claude rewrites summary, bullet points, skills, and all sections
- Copy or download the result
- One-click deploy to Vercel

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your Anthropic API key from [console.anthropic.com](https://console.anthropic.com).

### 3. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel (go live in ~2 minutes)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In the Vercel dashboard, add an environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

Vercel will give you a public URL — share it with anyone.

---

## Project Structure

```
resumade-easy/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── customize/
│   │   │       └── route.ts      ← API route (calls Claude)
│   │   ├── globals.css           ← Global styles & fonts
│   │   ├── layout.tsx            ← Root layout
│   │   └── page.tsx              ← Home page
│   └── components/
│       └── ResumeAgent.tsx       ← Main UI component
├── .env.local.example
├── package.json
└── README.md
```

## Customizing the AI behavior

Edit the `SYSTEM_PROMPT` in `src/app/api/customize/route.ts` to change how Claude customizes resumes.
