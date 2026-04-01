export type ProjectStatus = "open" | "assigned" | "completed";
export type MilestoneStatus = "pending" | "submitted" | "approved" | "dispute" | "reassigned" | "completed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: MilestoneStatus;
  githubLink?: string;
}

export interface Freelancer {
  name: string;
  rating: number;
  avatar: string;
  completedProjects: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  outcome: string;
  techStack: string[];
  budget: string;
  status: ProjectStatus;
  milestones: Milestone[];
  assignedFreelancer?: Freelancer;
  ownerId: string;
  assignedFreelancerId?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "DeFi Governance Dashboard",
    description: "Create a modern React-based governance dashboard for a leading DeFi protocol. Needs voting integration and complex data visualizations.",
    outcome: "A fully functional, responsive dashboard with wallet connection and Snapshot voting integration.",
    techStack: ["React", "Typescript", "Ethers.js", "TailwindCSS"],
    budget: "2,500 ALGO",
    status: "assigned",
    ownerId: "user_1",
    assignedFreelancer: {
      name: "David Chen",
      rating: 4.9,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      completedProjects: 20
    },
    assignedFreelancerId: "a1",
    milestones: [
      { id: "m1", title: "UI Components Design", description: "Design and implement core dashboard cards and layouts.", amount: "500 ALGO", status: "completed", githubLink: "github.com/davidc/defi-dashboard-ui" },
      { id: "m2", title: "Smart Contract Integration", description: "Connect frontend to governance contracts using Ethers.js.", amount: "1,000 ALGO", status: "approved", githubLink: "github.com/davidc/defi-dashboard-contracts" },
      { id: "m3", title: "Final Security Audit & Launch", description: "Audit frontend logic and deploy to testnet.", amount: "1,000 ALGO", status: "submitted", githubLink: "github.com/davidc/defi-dashboard-audit" },
    ]
  },
  {
    id: "2",
    title: "AI Image Generation API",
    description: "Build a Node.js backend using OpenAI's API for dynamic image generation. Must handle rate limiting and scaling.",
    outcome: "Production-ready API service with documentation and usage monitoring.",
    techStack: ["Next.js", "Node.js", "OpenAI", "Prisma"],
    budget: "1,200 ALGO",
    status: "assigned",
    ownerId: "user_2",
    assignedFreelancer: {
      name: "Alex River",
      rating: 4.9,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      completedProjects: 12
    },
    assignedFreelancerId: "user_1",
    milestones: [
      { id: "m1", title: "API Architecture Setup", description: "Initial scaffolding and OpenAI integration.", amount: "300 ALGO", status: "approved", githubLink: "github.com/alexriver/api-scaffold" },
      { id: "m2", title: "Scaling & Rate Limiting", description: "Implement Redis-based rate limiting.", amount: "400 ALGO", status: "submitted", githubLink: "github.com/alexriver/redis-rate-limit" },
      { id: "m3", title: "Frontend Client Library", description: "SDK for easy API consumption.", amount: "500 ALGO", status: "pending" },
    ]
  },
  {
    id: "3",
    title: "NFT Marketplace Strategy",
    description: "Develop a secure and optimized marketplace with royalty support. Needs rigorous testing on testnet.",
    outcome: "Deployed marketplace contract with 100% test coverage.",
    techStack: ["Solidity", "Hardhat", "OpenZeppelin"],
    budget: "3,500 ALGO",
    status: "open",
    ownerId: "user_1",
    milestones: [
      { id: "m1", title: "Core Marketplace Contract", description: "Listing and buying logic.", amount: "1,000 ALGO", status: "pending" },
      { id: "m2", title: "Royalty Implementation", description: "EIP-2981 standard integration.", amount: "1,000 ALGO", status: "pending" },
      { id: "m3", title: "Audit Fixes", description: "Resolve initial audit findings.", amount: "1,500 ALGO", status: "pending" },
    ]
  },
  {
    id: "4",
    title: "Cross-chain Bridge UI",
    description: "A clean and responsive UI for bridging assets between Ethereum and L2s. Focus on UX and animations.",
    outcome: "High-fidelity UI components built with Framer Motion.",
    techStack: ["Next.js", "Framer Motion", "Wagmi"],
    budget: "800 ALGO",
    status: "completed",
    ownerId: "user_3",
    assignedFreelancer: {
      name: "Sarah Chen",
      rating: 5.0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      completedProjects: 24
    },
    milestones: [
      { id: "m1", title: "Mockup Implementation", description: "Pixel-perfect React setup.", amount: "400 ALGO", status: "completed", githubLink: "github.com/sarahchen/cross-chain-ui-1" },
      { id: "m2", title: "Interactive Animations", description: "Complex state transitions.", amount: "400 ALGO", status: "completed", githubLink: "github.com/sarahchen/cross-chain-ui-final" },
    ]
  },
  {
    id: "5",
    title: "Algorand Smart Contract Audit",
    description: "In-depth security audit for a new ASA lending protocol. Focus on Teal logic and edge cases.",
    outcome: "Comprehensive audit report with identified vulnerabilities and fixes.",
    techStack: ["PyTeal", "Beaker", "Security"],
    budget: "5,000 ALGO",
    status: "open",
    ownerId: "user_1",
    milestones: [
      { id: "m1", title: "Initial Code Review", description: "Line-by-line analysis of Teal contracts.", amount: "1,500 ALGO", status: "pending" },
      { id: "m2", title: "Vulnerability Scanning", description: "Run automated tools and manual exploits.", amount: "2,000 ALGO", status: "pending" },
      { id: "m3", title: "Final Report Delivery", description: "Detailed documentation of findings.", amount: "1,500 ALGO", status: "pending" },
    ]
  },
  {
    id: "6",
    title: "Web3 Social Media Bot",
    description: "Develop a Telegram bot that tracks wallet movements and notifies users of major whale activity.",
    outcome: "Functional Telegram bot with wallet tracking and customizable alerts.",
    techStack: ["Node.js", "Telegraf", "Alchemy"],
    budget: "600 ALGO",
    status: "assigned",
    ownerId: "user_4",
    assignedFreelancer: {
      name: "Marcus Aurelius",
      rating: 4.8,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      completedProjects: 8
    },
    assignedFreelancerId: "user_1",
    milestones: [
      { id: "m1", title: "Bot Core Logic", description: "Setup Telegram API and basic commands.", amount: "200 ALGO", status: "approved", githubLink: "github.com/marcus/tg-bot-core" },
      { id: "m2", title: "Wallet Indexing", description: "Connect to blockchain for real-time tracking.", amount: "200 ALGO", status: "submitted", githubLink: "github.com/marcus/wallet-indexer" },
      { id: "m3", title: "Notification Engine", description: "Customizable alerts system.", amount: "200 ALGO", status: "pending" },
    ]
  },
  {
    id: "7",
    title: "Metaverse Billboard System",
    description: "Create a dynamic advertising system for Decentraland parcels. Needs an ad management dashboard.",
    outcome: "Integrated billboard system with ad-buying marketplace.",
    techStack: ["Decentraland SDK", "Three.js", "React"],
    budget: "4,200 ALGO",
    status: "open",
    ownerId: "user_5",
    milestones: [
      { id: "m1", title: "3D Asset Design", description: "Create billboard models and textures.", amount: "1,000 ALGO", status: "pending" },
      { id: "m2", title: "Ad Manager Dashboard", description: "React frontend for advertisers.", amount: "2,000 ALGO", status: "pending" },
      { id: "m3", title: "Parcel Integration", description: "Deploy to Decentraland testnet.", amount: "1,200 ALGO", status: "pending" },
    ]
  },
  {
    id: "8",
    title: "Rust-based Solana Program",
    description: "Write an optimized escrow program on Solana using Anchor framework. Security is top priority.",
    outcome: "Fully tested and audited Solana program.",
    techStack: ["Rust", "Solana", "Anchor"],
    budget: "3,000 ALGO",
    status: "completed",
    ownerId: "user_1",
    assignedFreelancer: {
      name: "Julia Stark",
      rating: 5.0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
      completedProjects: 45
    },
    milestones: [
      { id: "m1", title: "Program Architecture", description: "Define accounts and instructions.", amount: "1,000 ALGO", status: "completed" },
      { id: "m2", title: "Safety Assertions", description: "Implement robust security checks.", amount: "1,000 ALGO", status: "completed" },
      { id: "m3", title: "Integration Tests", description: "End-to-end testing with Typescript.", amount: "1,000 ALGO", status: "completed" },
    ]
  },
  {
    id: "9",
    title: "Zero Knowledge Proof Wallet",
    description: "Experimental mobile wallet emphasizing privacy via ZK-SNARKs. Research-heavy project.",
    outcome: "Proof-of-concept mobile wallet with privacy features.",
    techStack: ["Flutter", "Circom", "SnarkJS"],
    budget: "7,500 ALGO",
    status: "open",
    ownerId: "user_6",
    milestones: [
      { id: "m1", title: "Circuit Design", description: "Design ZK circuits for private transactions.", amount: "2,500 ALGO", status: "pending" },
      { id: "m2", title: "Mobile UI Shell", description: "Flutter foundation with basic wallet ops.", amount: "2,000 ALGO", status: "pending" },
      { id: "m3", title: "Full Privacy Loop", description: "End-to-end private transaction flow.", amount: "3,500 ALGO", status: "pending" },
    ]
  }
];
