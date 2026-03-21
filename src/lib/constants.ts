export const siteConfig = {
  name: "GAINS Institute",
  fullName: "Global Institute of Governance, AI & Sustainability",
  description:
    "GAINS equips boards and institutions with the governance frameworks, networks, and capabilities to lead responsibly through AI transformation and the net-zero transition.",
  url: "https://gainsinstitute.org",
};

export const navigation = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Insights", href: "/insights" },
] as const;

export const partners = [
  "Oxford",
  "Stanford",
  "INSEAD",
  "Tsinghua",
  "IESE",
] as const;

export const stats = [
  { value: 500, suffix: "+", label: "Board Members" },
  { value: 40, suffix: "+", label: "Countries Represented" },
  { value: 50, suffix: "+", label: "Partner Institutions" },
  { value: 15, suffix: "+", label: "Active Programs" },
] as const;

export const pillars = [
  {
    title: "Board Governance",
    tagline: "AI-ready boardrooms",
    description:
      "Structured programs that prepare boards to govern AI adoption, algorithmic risk, and digital transformation — with frameworks tested across 40+ countries.",
    slug: "board-governance",
  },
  {
    title: "Stewardship & Value",
    tagline: "Long-term thinking, codified",
    description:
      "Tools and peer networks for chairs, NEDs, and executives embedding sustainability, stakeholder capitalism, and intergenerational value into corporate strategy.",
    slug: "stewardship-value",
  },
  {
    title: "Succession & Development",
    tagline: "The next generation of governance",
    description:
      "Board-ready development programs and succession frameworks designed with Oxford Saïd, INSEAD, and Tsinghua SEM.",
    slug: "succession-development",
  },
] as const;

export const footerLinks = {
  programs: [
    { label: "Board Governance", href: "/programs/board-governance" },
    { label: "Stewardship & Value", href: "/programs/stewardship-value" },
    { label: "Succession & Development", href: "/programs/succession-development" },
    { label: "All Programs", href: "/programs" },
  ],
  institute: [
    { label: "About", href: "/about" },
    { label: "Team", href: "/about#team" },
    { label: "Partners", href: "/about#partners" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
