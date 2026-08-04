```md
# Project Structure

This project uses route-colocated components instead of features/.

src/
├── app/
│   └── users/
│       ├── page.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       └── components/
│           ├── user-list.tsx
│           ├── user-toolbar.tsx
│           ├── user-skeleton.tsx
│           └── user-empty-state.tsx
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

Rules:
- Route-specific components stay inside app/[route]/components
- Shared reusable components stay inside components/shared
- Base UI components stay inside components/ui
- Layout components stay inside components/layout
- Do not put business-specific components inside components/ui
```
