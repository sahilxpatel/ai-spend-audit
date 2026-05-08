import { ToolPricing } from "@/types/audit";

export const pricing: Record<string, ToolPricing> = {
  cursor: {
    category: "coding",
    useCases: ["coding"],
    plans: {
      hobby: {
        name: "Hobby",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["Basic AI completions", "Limited Claude 3.5 Sonnet", "Basic terminal integration"],
      },
      pro: {
        name: "Pro",
        price: 20,
        recommendedTeamSize: [1, 5],
        capabilities: ["Unlimited premium models", "Advanced codebase indexing", "Composer features"],
      },
      business: {
        name: "Business",
        price: 40,
        recommendedTeamSize: [5, 100],
        capabilities: ["Centralized billing", "Privacy mode enforcement", "SSO integration"],
      },
    },
  },
  github_copilot: {
    category: "coding",
    useCases: ["coding"],
    plans: {
      individual: {
        name: "Individual",
        price: 10,
        recommendedTeamSize: [1],
        capabilities: ["Code completions", "Chat in IDE", "Public code filtering"],
      },
      business: {
        name: "Business",
        price: 19,
        recommendedTeamSize: [2, 50],
        capabilities: ["Organization management", "IP indemnity", "Admin controls"],
      },
      enterprise: {
        name: "Enterprise",
        price: 39,
        recommendedTeamSize: [50, 1000],
        capabilities: ["Custom fine-tuning", "GitHub Enterprise integration", "Advanced security"],
      },
    },
  },
  claude: {
    category: "general-chat",
    useCases: ["writing", "coding", "data-analysis", "research", "general-chat"],
    plans: {
      free: {
        name: "Free",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["Basic Claude 3.5 Sonnet", "Limited messages"],
      },
      pro: {
        name: "Pro",
        price: 20,
        recommendedTeamSize: [1, 4],
        capabilities: ["Priority access", "Claude 3.5 Opus", "Artifacts", "Projects"],
      },
      team: {
        name: "Team",
        price: 30, // 30 per user, min 5 users is handled at engine level
        recommendedTeamSize: [5, 50],
        capabilities: ["Centralized billing", "Admin dashboard", "Shared chats"],
      },
    },
  },
  chatgpt: {
    category: "general-chat",
    useCases: ["writing", "coding", "data-analysis", "research", "general-chat", "operations"],
    plans: {
      free: {
        name: "Free",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["GPT-4o mini", "Basic web search", "Limited DALL-E"],
      },
      plus: {
        name: "Plus",
        price: 20,
        recommendedTeamSize: [1, 2],
        capabilities: ["GPT-4o", "Advanced Data Analysis", "Custom GPTs"],
      },
      team: {
        name: "Team",
        price: 30, // Monthly billing
        recommendedTeamSize: [3, 100],
        capabilities: ["Shared workspace", "Admin console", "No training on data"],
      },
    },
  },
  gemini: {
    category: "general-chat",
    useCases: ["writing", "research", "data-analysis", "general-chat"],
    plans: {
      advanced: {
        name: "Advanced",
        price: 19.99,
        recommendedTeamSize: [1],
        capabilities: ["Gemini 1.5 Pro", "Google Workspace integration", "2TB cloud storage"],
      },
      enterprise: {
        name: "Enterprise",
        price: 30,
        recommendedTeamSize: [10, 1000],
        capabilities: ["Enterprise security", "Admin tools", "Data protection"],
      },
    },
  },
  windsurf: {
    category: "coding",
    useCases: ["coding"],
    plans: {
      free: {
        name: "Free",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["Basic context awareness", "Limited completions"],
      },
      pro: {
        name: "Pro",
        price: 15,
        recommendedTeamSize: [1, 5],
        capabilities: ["Premium models", "Full codebase awareness", "Advanced agents"],
      },
      enterprise: {
        name: "Enterprise",
        price: 39, // Custom pricing typically, assuming 39 for comparison
        recommendedTeamSize: [10, 500],
        capabilities: ["VPC deployment", "SSO", "Custom models"],
      },
    },
  },
};
