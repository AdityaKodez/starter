import {
  IconBookmark,
  IconCircleX,
  IconHome,
  IconUpload,
  type Icon,
} from "@tabler/icons-react"

export type HomeNavItem = {
  label: string
  href: string
  icon: Icon
  description: string
  empty: {
    eyebrow: string
    title: string
    description: string
    actionLabel: string
    secondaryActionLabel?: string
    icon: Icon
  }
}

export const homeNavItems: HomeNavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: IconHome,
    description: "Understand your study patterns, next steps, and progress at a glance.",
    empty: {
      eyebrow: "No activity yet",
      title: "Your dashboard is waiting for a test",
      description:
        "Upload a test or start practicing to unlock progress cards, accuracy trends, and personalized next actions.",
      actionLabel: "Upload Test",
      secondaryActionLabel: "Start Practice",
      icon: IconUpload,
    },
  },
  {
    label: "Mistakes",
    href: "/home/mistakes",
    icon: IconCircleX,
    description: "Understand your mistakes. Fix them. Improve for good.",
    empty: {
      eyebrow: "No mistakes found",
      title: "Mistakes will appear after your first test",
      description:
        "Once a test is analyzed, this space will group conceptual, silly, calculation, and careless mistakes for review.",
      actionLabel: "Upload Test",
      secondaryActionLabel: "View Practice",
      icon: IconCircleX,
    },
  },
  {
    label: "Bookmark",
    href: "/home/bookmark",
    icon: IconBookmark,
    description: "Save important questions, explanations, and revision prompts for later.",
    empty: {
      eyebrow: "Nothing bookmarked",
      title: "Saved items will collect here",
      description:
        "Bookmark questions or insights while reviewing so you can return to them during focused revision.",
      actionLabel: "Explore Mistakes",
      secondaryActionLabel: "Go to Dashboard",
      icon: IconBookmark,
    },
  },
]

export const getHomeNavItem = (href: string) =>
  homeNavItems.find((item) => item.href === href) ?? homeNavItems[0]
