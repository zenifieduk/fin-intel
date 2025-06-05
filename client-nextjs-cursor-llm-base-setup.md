# Client Next.js + Cursor LLM Base Setup Guide

This document provides step-by-step instructions to recreate the perfect Next.js 15 + Tailwind CSS v4 project foundation for client projects.

## 🎯 Overview

This setup creates a production-ready React application with:
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS v4** with modern CSS-first configuration
- **Comprehensive design system** with light/dark mode
- **Accessible UI components** using Radix UI
- **Modern development tooling** (ESLint, Prettier, etc.)
- **Beautiful landing page** demonstrating the stack

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub CLI installed (optional, for repository creation)
- Cursor or VS Code with appropriate extensions

## 🚀 Step-by-Step Setup

### 1. Create Next.js Project

```bash
# Navigate to desired directory
cd /path/to/workspace

# Create Next.js project with all modern features
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 2. Install Essential Dependencies

```bash
# UI and Icon Libraries
npm install lucide-react clsx tailwind-merge class-variance-authority

# Radix UI Primitives for Accessibility
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Development Tools
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

### 3. Create Utility Functions

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4. Configure Prettier

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 5. Enhanced Global Styles

Update `src/app/globals.css` with comprehensive design system:
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --popover: #ffffff;
  --popover-foreground: #171717;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #171717;
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius: var(--radius);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --card: #0a0a0a;
    --card-foreground: #ededed;
    --popover: #0a0a0a;
    --popover-foreground: #ededed;
    --primary: #ededed;
    --primary-foreground: #171717;
    --secondary: #262626;
    --secondary-foreground: #ededed;
    --muted: #262626;
    --muted-foreground: #737373;
    --accent: #262626;
    --accent-foreground: #ededed;
    --destructive: #7f1d1d;
    --destructive-foreground: #ededed;
    --border: #262626;
    --input: #262626;
    --ring: #d4d4d8;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}
```

### 6. Create Reusable Button Component

Create `src/components/ui/button.tsx`:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 7. Create Modern Landing Page

Update `src/app/page.tsx`:
```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Github, Rocket, Sparkles, Code, Palette, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">[Project Name]</span>
          </div>
          <Button variant="outline" size="sm">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              <Rocket className="h-3 w-3 mr-1" />
              Next.js 15 + Tailwind CSS v4
            </span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Ready to Build
            <span className="block text-primary">Something Amazing</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your React project is set up with Next.js 15, Tailwind CSS v4, TypeScript, 
            and all the modern tools you need to build beautiful, fast applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" className="text-base px-8">
              <Code className="h-4 w-4 mr-2" />
              Start Coding
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8">
              <Palette className="h-4 w-4 mr-2" />
              View Components
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Built with Next.js 15 and optimized for performance with the latest React features.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Palette className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Beautiful Design</h3>
            <p className="text-muted-foreground">
              Tailwind CSS v4 with a comprehensive design system and dark mode support.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Code className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Developer Ready</h3>
            <p className="text-muted-foreground">
              TypeScript, ESLint, Prettier, and modern tooling configured out of the box.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 p-8 rounded-lg border bg-card text-card-foreground shadow-sm max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <span className="font-semibold">Next.js 15</span>
              <span className="text-muted-foreground">React Framework</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <span className="font-semibold">Tailwind v4</span>
              <span className="text-muted-foreground">CSS Framework</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <span className="font-semibold">TypeScript</span>
              <span className="text-muted-foreground">Type Safety</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
              <span className="font-semibold">Radix UI</span>
              <span className="text-muted-foreground">Components</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; 2024 [Project Name]. Ready to build something amazing.</p>
      </footer>
    </div>
  )
}
```

### 8. Initialize Git and GitHub Repository

```bash
# Initialize git (should already be done by create-next-app)
git init

# Stage all changes
git add .

# Initial commit
git commit -m "Initial commit: Next.js 15 + Tailwind CSS v4 project setup with modern tooling and components"

# Create GitHub repository (requires GitHub CLI)
gh repo create [project-name] --public --source=. --remote=origin --push
```

### 9. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your beautiful new project!

## 📁 Final Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with design system
├── components/
│   └── ui/             # Reusable UI components
│       └── button.tsx  # Button component with variants
└── lib/
    └── utils.ts        # Utility functions
```

## 🎨 Design System Features

- **CSS Variables**: Comprehensive color palette with light/dark mode
- **Component Variants**: Button component with 6 variants and 4 sizes
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: Built on Radix UI primitives for excellent a11y
- **Type Safety**: Full TypeScript integration with proper types

## 🔧 Customization

### Add New Components
1. Create in `src/components/ui/`
2. Use `class-variance-authority` for variants
3. Import utilities from `@/lib/utils`
4. Follow the Button component pattern

### Extend Design System
1. Add CSS variables to `globals.css`
2. Update the `@theme inline` block
3. Add dark mode variants in the media query

### Additional Dependencies
Common additions for client projects:
```bash
# Forms
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand

# Data Fetching
npm install @tanstack/react-query

# Animations
npm install framer-motion

# Date/Time
npm install date-fns
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
The project is configured for deployment on:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform

## 📝 Notes

- This setup uses Tailwind CSS v4's new CSS-first configuration
- All components are built with accessibility in mind
- The design system supports both light and dark modes automatically
- TypeScript is configured with strict settings for maximum type safety
- ESLint and Prettier are configured for consistent code quality

## 🎯 Perfect For

- Client projects requiring modern UI
- Rapid prototyping
- Production applications
- Design system foundations
- Component library development

---

**Created**: 2024  
**Version**: Next.js 15 + Tailwind CSS v4  
**Compatibility**: Node.js 18+  
**License**: Open Source 