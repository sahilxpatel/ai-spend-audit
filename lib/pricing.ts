import { ToolPricing } from "@/types/audit";

export const pricing: Record<string, ToolPricing> = {
  // Source: https://www.cursor.com/pricing (verified 2026-05-12)
  cursor: {
    displayName: "Cursor",
    category: "coding",
    useCases: ["coding"],
    plans: {
      hobby: {
        name: "Hobby",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["Basic AI completions", "Limited model access", "Basic terminal integration"],
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
      enterprise: {
        name: "Enterprise",
        price: 0,
        pricingType: "custom",
        priceNote: "Contact sales",
        recommendedTeamSize: [100, 1000],
        capabilities: ["Enterprise security", "SLA", "Custom procurement"],
      },
    },
  },
  // Source: https://github.com/features/copilot/pricing (verified 2026-05-12)
  github_copilot: {
    displayName: "GitHub Copilot",
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
        capabilities: ["Enterprise policy controls", "Advanced security", "Compliance support"],
      },
    },
  },
  // Source: https://openai.com/chatgpt/pricing/ (verified 2026-05-12)
  chatgpt: {
    displayName: "ChatGPT",
    category: "general-chat",
    useCases: ["writing", "coding", "data-analysis", "research", "general-chat", "operations", "mixed"],
    plans: {
      plus: {
        name: "Plus",
        price: 20,
        recommendedTeamSize: [1, 2],
        capabilities: ["GPT-4o", "Advanced Data Analysis", "Custom GPTs"],
      },
      team: {
        name: "Team",
        price: 30,
        recommendedTeamSize: [3, 100],
        capabilities: ["Shared workspace", "Admin console", "No training on data"],
      },
      enterprise: {
        name: "Enterprise",
        price: 0,
        pricingType: "custom",
        priceNote: "Contact sales",
        recommendedTeamSize: [100, 2000],
        capabilities: ["Enterprise security", "SLA", "Compliance support"],
      },
      api: {
        name: "API",
        price: 0,
        pricingType: "usage",
        priceNote: "Usage-based",
        recommendedTeamSize: [1, 2000],
        capabilities: ["Pay-as-you-go API access", "Model API", "No seat limit"],
      },
    },
  },
  // Source: https://claude.ai/pricing (verified 2026-05-12)
  claude: {
    displayName: "Claude",
    category: "general-chat",
    useCases: ["writing", "coding", "data-analysis", "research", "general-chat", "mixed"],
    plans: {
      free: {
        name: "Free",
        price: 0,
        recommendedTeamSize: [1],
        capabilities: ["Basic access", "Limited usage", "Standard response time"],
      },
      pro: {
        name: "Pro",
        price: 20,
        recommendedTeamSize: [1, 4],
        capabilities: ["Priority access", "Higher usage limits", "Artifacts"],
      },
      max: {
        name: "Max",
        price: 60,
        recommendedTeamSize: [1, 4],
        capabilities: ["Highest usage limits", "Faster throughput", "Priority access"],
      },
      team: {
        name: "Team",
        price: 30,
        recommendedTeamSize: [5, 50],
        capabilities: ["Centralized billing", "Admin dashboard", "Shared chats"],
      },
      enterprise: {
        name: "Enterprise",
        price: 0,
        pricingType: "custom",
        priceNote: "Contact sales",
        recommendedTeamSize: [50, 2000],
        capabilities: ["Enterprise security", "SLA", "Compliance support"],
      },
      api: {
        name: "API",
        price: 0,
        pricingType: "usage",
        priceNote: "Usage-based",
        recommendedTeamSize: [1, 2000],
        capabilities: ["Pay-as-you-go API access", "Model API", "No seat limit"],
      },
    },
  },
  // Source: https://gemini.google.com/advanced and https://cloud.google.com/vertex-ai/pricing (verified 2026-05-12)
  gemini: {
    displayName: "Gemini",
    category: "general-chat",
    useCases: ["writing", "research", "data-analysis", "general-chat", "mixed"],
    plans: {
      pro: {
        name: "Pro",
        price: 19.99,
        recommendedTeamSize: [1],
        capabilities: ["Gemini advanced model access", "Workspace integration", "2TB cloud storage"],
      },
      ultra: {
        name: "Ultra",
        price: 29.99,
        recommendedTeamSize: [2, 10],
        capabilities: ["Highest tier model access", "Priority compute", "Extended context"],
      },
      enterprise: {
        name: "Enterprise",
        price: 0,
        pricingType: "custom",
        priceNote: "Contact sales",
        recommendedTeamSize: [10, 2000],
        capabilities: ["Enterprise security", "Admin tools", "Data protection"],
      },
      api: {
        name: "API",
        price: 0,
        pricingType: "usage",
        priceNote: "Usage-based",
        recommendedTeamSize: [1, 2000],
        capabilities: ["Pay-as-you-go API access", "Vertex AI models", "No seat limit"],
      },
    },
  },
  // Source: https://platform.openai.com/pricing (verified 2026-05-12)
  openai_api: {
    displayName: "OpenAI API",
    category: "general-chat",
    useCases: ["coding", "writing", "data-analysis", "research", "general-chat", "operations", "mixed"],
    plans: {
      api: {
        name: "API",
        price: 0,
        pricingType: "usage",
        priceNote: "Usage-based",
        recommendedTeamSize: [1, 5000],
        capabilities: ["Pay-as-you-go API access", "Model API", "No seat limit"],
      },
    },
  },
  // Source: https://www.anthropic.com/pricing (verified 2026-05-12)
  anthropic_api: {
    displayName: "Anthropic API",
    category: "general-chat",
    useCases: ["coding", "writing", "data-analysis", "research", "general-chat", "mixed"],
    plans: {
      api: {
        name: "API",
        price: 0,
        pricingType: "usage",
        priceNote: "Usage-based",
        recommendedTeamSize: [1, 5000],
        capabilities: ["Pay-as-you-go API access", "Claude API", "No seat limit"],
      },
    },
  },
  // Source: https://windsurf.codeium.com/pricing (verified 2026-05-12)
  windsurf: {
    displayName: "Windsurf",
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
        price: 0,
        pricingType: "custom",
        priceNote: "Contact sales",
        recommendedTeamSize: [10, 500],
        capabilities: ["VPC deployment", "SSO", "Custom models"],
      },
    },
  },
};
