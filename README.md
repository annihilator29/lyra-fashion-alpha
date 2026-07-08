# Lyra Fashion

[![CI](https://github.com/annihilator29/lyra-fashion-alpha/actions/workflows/ci.yml/badge.svg)](https://github.com/annihilator29/lyra-fashion-alpha/actions/workflows/ci.yml)

A premium, factory-direct e-commerce platform bringing ethically-made artisan fashion directly to consumers. Built with modern web technologies for performance, SEO, and a seamless shopping experience.

## 🌟 About

Lyra Fashion connects customers directly with skilled artisans, eliminating middlemen to offer premium quality at honest prices. Our platform emphasizes **transparency**, **craftsmanship**, and **ethical production**.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)
- **State Management**: Zustand
- **UI Components**: shadcn/ui

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lyra-fashion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your:

- Supabase credentials (Story 1.3)
- Stripe keys (Epic 3)
- Resend API key (Epic 3)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start development server on `localhost:3000`             |
| `npm run build`        | Create optimized production build                        |
| `npm run start`        | Start production server (requires `npm run build` first) |
| `npm run lint`         | Run ESLint to check code quality                         |
| `npm run format`       | Format code with Prettier                                |
| `npm run format:check` | Check if code is formatted correctly                     |
| `npm run type-check`   | Run TypeScript type checking                             |

## 🚀 Deployment

### Vercel Deployment

This project is deployed on [Vercel](https://vercel.com/) with automatic deployments:

- **Production**: Deployed on merge to `master` branch
- **Preview**: Deployed for every pull request

#### Initial Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project" → Import from GitHub
3. Select the repository and configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `lyra-fashion/`
   - **Build Command**: `npm run build` (default)
   - **Install Command**: `npm install` (default)

#### Environment Variables

Configure the following in Vercel Project Settings → Environment Variables:

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production Only** | Supabase service role key (secret) |
| `NEXT_PUBLIC_APP_URL` | All | Application base URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | All | Stripe publishable key (when configured) |
| `STRIPE_SECRET_KEY` | Production Only | Stripe secret key (when configured) |
| `STRIPE_WEBHOOK_SECRET` | Production Only | Stripe webhook secret (when configured) |

> ⚠️ **Security**: Never add `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to Preview deployments.

#### Rollback

If a deployment fails or causes issues:
1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"

### CI/CD Pipeline

GitHub Actions runs on every pull request:
- ESLint code quality checks
- TypeScript type checking
- Production build verification

All checks must pass before merging.

## 🔧 Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes** following our coding standards
3. **Run linting and formatting**: `npm run lint && npm run format`
4. **Test your changes**: `npm run build` to ensure no build errors
5. **Commit your work** using conventional commit messages (see below)
6. **Push and open a pull request**

## 💬 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code restructuring (no behavior changes)
- `test`: Adding or updating tests
- `chore`: Build tasks, dependencies, tooling

**Examples:**

```bash
feat(cart): add quantity selector to cart items
fix(checkout): resolve payment processing error
docs(readme): update setup instructions
chore(deps): upgrade Next.js to 15.3
```

## 📁 Project Structure

```
lyra-fashion/
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, API routes)
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components (shadcn/ui)
│   │   └── shop/        # Shop-specific components
│   ├── lib/             # Utility functions and helpers
│   ├── types/           # TypeScript type definitions
│   └── emails/          # Email templates (React Email)
├── public/              # Static assets
├── docs/                # Project documentation
└── supabase/            # Supabase migrations and config
```

## 🧪 Testing

Testing setup will be configured in Story 1.2:

- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **API Mocking**: MSW (Mock Service Worker)

## 🤝 Contributing

This is a private project. Please follow the development workflow and coding standards outlined above.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for artisan makers and conscious consumers**
