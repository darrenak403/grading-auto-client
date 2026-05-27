export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  defaultOpen: boolean;
  items: NavItem[];
}

export const siteConfig = {
  name: "PRN232 Auto Grader",
  description: "Automated grading system for PRN232 programming assignments",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5049/api/v1",
  author: {
    name: "PRN232 Team",
  },
  standaloneItems: [
    { label: "Dashboard", href: "/dashboard" },
  ] satisfies NavItem[],
  navGroups: [
    {
      label: "PE Exam Grading",
      defaultOpen: true,
      items: [
        { label: "Exam Sessions", href: "/exam-sessions" },
        { label: "Submissions", href: "/submissions" },
        { label: "Exports", href: "/exports" },
      ],
    },
    {
      label: "Lab Grading",
      defaultOpen: true,
      items: [
        { label: "Semesters", href: "/lab/semesters" },
        { label: "Lab Assignments", href: "/lab/assignments" },
      ],
    },
  ] satisfies NavGroup[],
  /** @deprecated Use navGroups — kept for backward compatibility */
  navItems: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Exam Sessions", href: "/exam-sessions" },
    { label: "Submissions", href: "/submissions" },
    { label: "Exports", href: "/exports" },
  ],
};
