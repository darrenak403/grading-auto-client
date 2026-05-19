````md
# Frontend OS Usage Guide

# Overview

Frontend OS is an AI-assisted frontend engineering workflow system for:

- Next.js App Router
- React
- Tailwind
- shadcn/ui
- TanStack Query
- Axios API layer

It combines:
- skills
- workflows
- prompts
- checklists
- snippets
- architecture conventions

to create a production-ready frontend workflow.

---

# Folder Structure

```txt
frontend-os/
│
├── .agents/
│   └── skills/
│
├── architecture/
├── checklists/
├── commands/
├── prompts/
├── snippets/
├── workflows/
│
└── skills-lock.json
````

---

# Main Concepts

| Folder           | Purpose                           |
| ---------------- | --------------------------------- |
| `.agents/skills` | executable workflows for agent    |
| `commands`       | workflow definitions              |
| `prompts`        | AI execution prompts              |
| `checklists`     | audit and review standards        |
| `architecture`   | project conventions               |
| `snippets`       | reusable implementation templates |
| `workflows`      | workflow registry/router          |

---

# Project Architecture

This project uses:

```txt
route-colocated components
```

Structure:

```txt
src/
├── app/
│   └── users/
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       └── components/
│           ├── user-list.tsx
│           ├── user-toolbar.tsx
│           └── user-skeleton.tsx
│
├── components/
│   ├── ui/
│   ├── shared/
│   └── layout/
│
├── lib/
├── hooks/
├── types/
└── utils/
```

Rules:

* Route-specific components stay inside app/[route]/components
* Shared reusable components go into components/shared
* Base components stay inside components/ui
* Do not put business-specific components into components/ui

---

# Available Workflows

| Workflow               | Purpose                            |
| ---------------------- | ---------------------------------- |
| `/new-ui`              | Build new UI                       |
| `/redesign-ui`         | Improve existing UI                |
| `/nextjs-architecture` | Review/refactor architecture       |
| `/project-setup`       | Setup new project foundation       |
| `/component-system`    | Build scalable component structure |
| `/animation-polish`    | Improve animations/interactions    |
| `/accessibility-audit` | Audit accessibility                |
| `/pre-release`         | Pre-merge gate (perf + SEO + a11y + production) |
| `/production-audit`    | Final UI/production review         |
| `/fix-performance`     | Fix rendering/performance issues   |
| `/seo-metadata`        | Setup metadata/SEO                 |
| `/harden-ui`           | Add loading/error/edge states      |
| `/use-snippet`         | Reuse snippets/templates           |

---

# Workflow Examples

## Build new page

```txt
/new-ui build users page with table and toolbar
```

---

## Redesign old UI

```txt
/redesign-ui improve dashboard layout and interactions
```

---

## Review architecture

```txt
/nextjs-architecture review app router and cache strategy
```

---

## Setup new project

```txt
/project-setup initialize new Next.js SaaS dashboard
```

---

## Improve animations

```txt
/animation-polish improve dropdown and dialog transitions
```

---

## Audit accessibility

```txt
/accessibility-audit audit users page
```

---

## Pre-release gate (recommended before merge)

```txt
/pre-release audit PR changes in app/users/ before merge
```

Covers: performance, SEO/metadata, accessibility, production quality.

---

## Final production review

```txt
/production-audit audit users module UI polish before merge
```

---

# Available Snippets

| Snippet              | Purpose                 |
| -------------------- | ----------------------- |
| `fetch-service.ts`   | API service template    |
| `query-hook.ts`      | TanStack Query hook     |
| `mutation-hook.ts`   | Mutation hook           |
| `page-shell.tsx`     | Standard page layout    |
| `empty-state.tsx`    | Empty state UI          |
| `confirm-dialog.tsx` | Reusable dialog pattern |

---

# Skill Purposes

| Skill                       | Purpose                        |
| --------------------------- | ------------------------------ |
| frontend-design             | UI/UX/layout                   |
| vercel-react-best-practices | React/Next.js best practices   |
| frontend-ui-engineering     | scalable frontend architecture |
| shadcn                      | shadcn/ui usage                |
| baseline-ui                 | base design system             |
| emil-design-eng             | premium UI polish              |
| transitions-dev             | transitions/interactions       |
| fixing-motion-performance   | animation optimization         |
| wcag-audit-patterns         | accessibility audit            |
| fixing-accessibility        | accessibility fixes            |
| web-quality-audit           | production review              |
| react-doctor                | React performance fixes        |
| fixing-metadata             | SEO metadata                   |

---

# Best Practices

* Prefer existing components before creating new ones
* Prefer snippets before generating new patterns
* Avoid duplicated logic
* Keep UI responsive and accessible
* Keep animations purposeful
* Keep route-specific logic near the route
* Avoid putting business logic inside components/ui

---

# Recommended Workflow

```txt
/new-ui
↓
/animation-polish
↓
/harden-ui
↓
/pre-release
```

---

# Final Goal

This system helps create:

```txt
AI-assisted Next.js Frontend Engineering Workflow
```

with:

* reusable architecture
* reusable prompts
* reusable audits
* reusable patterns
* production-grade frontend workflows

```
```
