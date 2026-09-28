Here is a comprehensive, professionally designed, and meticulously structured `README.md` file for your GitHub repository. It adheres to your minimalist, professional aesthetic (zero native emojis, clean formatting) and thoroughly documents every feature and modification we have built.

***

# README.md

```markdown
# SeeTruth

**SeeTruth** is a minimalist, calm-UI web platform dedicated to workplace transparency, salary insights, culture reviews, and business center ratings. It empowers professionals and customers to share unfiltered, honest experiences while fostering a respectful community through structured Q&A and threaded discussions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Platform
- **Dynamic Company Directory**: Real-time search and dynamic category filtering powered directly by the database.
- **Smart "List Company"**: Real-time autocomplete with duplicate prevention. If a company exists, users are seamlessly redirected to its profile.
- **Comprehensive Company Profiles**: Premium UI featuring cover photos, overlapping logos, rich metadata (website, address, established year), and visual rating breakdowns (Culture, Management, Compensation).

### Review & Rating System
- **Structured Reviews**: Dedicated sections for Pros, Cons, detailed comments, salary ranges, and image attachments.
- **Anti-Spam Voting**: Upvote/Downvote system protected by `localStorage` tracking to prevent endless manipulation, while securely updating database counts via Server Actions.
- **Anonymous Mode**: Global toggle in the user profile allowing users to post reviews and comments as "Anonymous Insider" while remaining authenticated.

### Community & Interaction
- **Reddit-Style Threaded Comments**: Nested, collapsible reply threads with independent voting and clear visual hierarchy.
- **Community Q&A Board**: Dedicated inquiry section where users can ask questions and insiders can provide verified replies.
- **Permanent Comment Warning**: Clear UI disclaimers reminding users that comments are permanent and cannot be deleted, encouraging respectful discourse.

### Architecture & UX
- **Full Authentication**: Secure Email/Password and Google OAuth via Supabase, capturing user metadata (Full Name) on signup.
- **Global Session Management**: Instant UI updates across all Server and Client components upon login/logout using `router.refresh()`.
- **Robust Dark/Light Mode**: Custom, script-free Theme Provider ensuring zero hydration warnings, system preference detection, and persistent `localStorage` state.
- **Mobile-First Responsive Design**: Sticky sidebars for desktop, horizontal scroll filters for mobile, and optimized touch targets.
- **AI Summary Teaser**: A premium, gradient-styled placeholder section indicating upcoming AI-powered review analysis.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (Custom variables, calm UI palette, dark mode support)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, SSR Auth)
- **Icons**: `react-icons` (Feather Icons exclusively)
- **State Management**: React Hooks (`useState`, `useTransition`, `useEffect`) + `localStorage` for client-side persistence

---

## Getting Started

### Prerequisites
- Node.js 18.17.0 or later
- npm, yarn, or pnpm
- A Supabase account and project

### Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEMO_MODE=false
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/biruk-tafese/seetruth.git
   cd seetruth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## Database Setup

1. Go to your **Supabase Dashboard** > **SQL Editor**.
2. Create a new query and run the schema setup script to create tables, enable Row Level Security (RLS), and set up policies. *(Refer to the `database/schema.sql` file in this repository for the complete DDL).*
3. Run the seed script to populate the database with 50 initial companies across various sectors (Banking, Tech, Hospitality, etc.) with zeroed-out ratings ready for organic growth.

> **Note on RLS**: The schema is configured to allow public read access to companies, reviews, and inquiries. Insertions for reviews and comments are permitted for both authenticated and anonymous users, with Server Actions handling the validation and `localStorage` enforcing the "one anonymous submission per entity" rule.

---

## Project Structure

```text
.
├── app/
│   ├── actions.ts            # Server Actions for reviews, comments, votes, and company creation
│   ├── auth/
│   │   ├── callback/route.ts # Supabase OAuth and email confirmation handler
│   │   └── page.tsx          # Authentication UI (Login/Signup)
│   ├── company/[slug]/
│   │   └── page.tsx          # Server Component fetching company data and nested comments
│   ├── layout.tsx            # Root layout with ThemeProvider, Header, and Footer
│   └── page.tsx              # Homepage with dynamic search, filtering, and InquiryBoard
├── components/
│   ├── AuthModal.tsx         # Reusable authentication modal
│   ├── CompanyProfileClient.tsx # Interactive review, voting, and threaded comment UI
│   ├── Header.tsx            # Responsive navigation with profile dropdown and anonymous toggle
│   ├── InquiryBoard.tsx      # Community Q&A section with nested reply support
│   ├── ListCompanyModal.tsx  # Smart company creation form with real-time autocomplete
│   └── ThemeProvider.tsx     # Custom, script-free dark/light mode context
├── data/
│   └── seedCompanies.ts      # Fallback mock data (used only if DEMO_MODE is true)
├── hooks/
│   └── useAnonymousGate.ts   # Custom hook enforcing one anonymous submission per company
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser Supabase client (@supabase/ssr)
│       └── server.ts         # Server-side Supabase client with cookie management
└── types/
    └── index.ts              # Strict TypeScript interfaces for all database entities
```

---

## Deployment

The easiest way to deploy SeeTruth is via **Vercel**:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the Environment Variables section in Vercel.
4. Click **Deploy**. Vercel will automatically detect the Next.js configuration and build the optimized production bundle.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with transparency, privacy, and clean code in mind.**
```

### How to use this:
1. Create a file named `README.md` in the root directory of your project.
2. Copy and paste the entire block above into it.
3. Commit and push to GitHub:
   ```powershell
   git add README.md
   git commit -m "docs: add comprehensive README with full project documentation"
   git push origin master
   ```

This README is clean, highly professional, strictly follows your no-emoji rule for a minimalist aesthetic, and perfectly documents every advanced feature (threaded comments, anti-spam voting, smart autocomplete, global auth state, and custom theming) we have implemented. It will make your GitHub repository look incredibly polished and ready for production or open-source collaboration.