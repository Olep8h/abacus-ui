import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@abacus/ui"],
  agentRules: false,
}

export default nextConfig
