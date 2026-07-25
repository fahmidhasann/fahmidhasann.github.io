# Graph Report - fahmidhasann.github.io  (2026-07-25)

## Corpus Check
- 13 files · ~243,428 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 222 nodes · 305 edges · 25 communities (16 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `992d740d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AI Freelancer Landscape
- Portfolio Projects & Stack
- openDialog
- Productivity & Meeting Tools
- AI Automation Agencies
- Freelancer Adoption Stats
- AI Agency Web Data
- No-Code Web Builders
- AI Freelancers Dataset
- AI vs Traditional Automation
- Agentic Workflow Concepts
- Claude Dev Settings
- Upwork Research Insights
- MCP & Playwright Config
- Vercel Security Headers
- Project Transcripts
- Vercel Deployment
- Graphify Watch Hook
- Freelancers Data File
- Medium Content
- Reddit Community
- YouTube Channel
- script.js
- DamKoto Transcript
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `Ashley Allen (freelance developer)` - 15 edges
2. `Project Management Automation` - 11 edges
3. `motionReduced()` - 9 edges
4. `initPrompt()` - 9 edges
5. `Freelance Business Automation` - 8 edges
6. `openDialog()` - 7 edges
7. `closeDialog()` - 7 edges
8. `initializeNavigation()` - 6 edges
9. `printLine()` - 6 edges
10. `smoothBehavior()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dam koto bot` --conceptually_related_to--> `AI-Powered Lead Generation & Cold Outreach Transcript`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt → graphify-out/transcripts/Al-Powered Lead Generation & Cold Outreach.txt

## Import Cycles
- None detected.

## Communities (25 total, 9 thin omitted)

### Community 0 - "AI Freelancer Landscape"
Cohesion: 0.11
Nodes (24): AI Agent, AI Cannot Replace Developers, AI Hallucination Problem, AI-Driven Layoffs, AI Tool, Ashley Allen (freelance developer), Battle Ready Laravel (book), ChatGPT (+16 more)

### Community 1 - "Portfolio Projects & Stack"
Cohesion: 0.50
Nodes (4): Agentic Workflow Concept, AI Agents vs Traditional Automation, AI Agents vs Traditional Dev Tools, Traditional Structured Workflow

### Community 3 - "Productivity & Meeting Tools"
Cohesion: 0.08
Nodes (26): Asana, Calendly, ClickUp, Commission-Free Freelance Platform, Content Marketing Automation, Contract Management Automation, Figma, Financial Management Automation (+18 more)

### Community 4 - "AI Automation Agencies"
Cohesion: 0.36
Nodes (9): AI Automation Stack for Freelancers, Client Acquisition Automation, Hostinger, Liam Ottley (YouTube creator), Lindy, Make (formerly Integromat), n8n, Workflow Orchestration Platform (+1 more)

### Community 5 - "Freelancer Adoption Stats"
Cohesion: 0.40
Nodes (5): 75% of Freelancers Use Generative AI, 90% of AI Adopters Report Skill Acceleration, Freelancer.com, Generative AI Adoption by Freelancers, AI-Enabled Niche Specialization

### Community 6 - "AI Agency Web Data"
Cohesion: 0.50
Nodes (3): data, web, success

### Community 7 - "No-Code Web Builders"
Cohesion: 0.50
Nodes (4): Framer AI Website Builder, Lovable + GitHub + Vercel Stack, AI Agencies Web Search Dataset, Webflow AI Website Builder

### Community 8 - "AI Freelancers Dataset"
Cohesion: 0.50
Nodes (3): data, web, success

### Community 9 - "AI vs Traditional Automation"
Cohesion: 0.50
Nodes (3): data, web, success

### Community 10 - "Agentic Workflow Concepts"
Cohesion: 0.10
Nodes (38): activateEasterEgg(), clearPageInert(), closeActiveDialog(), closeCommandPalette(), closeDialog(), closeMobileMenu(), closeVideoPopup(), createConfetti() (+30 more)

### Community 12 - "Upwork Research Insights"
Cohesion: 0.67
Nodes (3): 40% Higher Hourly Earnings with AI, AI Saves ~8 hrs/week for Freelancers, Upwork Research Institute

### Community 13 - "MCP & Playwright Config"
Cohesion: 0.50
Nodes (4): npx, Playwright MCP Server, playwright, @playwright/mcp

### Community 14 - "Vercel Security Headers"
Cohesion: 0.67
Nodes (3): Asset Cache Control (1yr immutable), Security Headers Configuration, X-Frame-Options: SAMEORIGIN

### Community 17 - "Graphify Watch Hook"
Cohesion: 0.22
Nodes (7): Architecture, Command Palette, Development, graphify, Overview, Project Filtering, Theming

### Community 22 - "script.js"
Cohesion: 0.07
Nodes (48): applyFilter(), clearConsole(), clearGhost(), closeDemo(), cmdHistory, COMMANDS, currentTheme(), demoSlugs() (+40 more)

### Community 29 - "AGENTS.md"
Cohesion: 0.20
Nodes (8): Architecture, Command Palette, Creative Work, Development, graphify, Overview, Project Filtering, Theming

## Ambiguous Edges - Review These
- `AI-Powered Lead Generation & Cold Outreach Transcript` → `Dam koto bot`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt · relation: conceptually_related_to

## Knowledge Gaps
- **74 isolated node(s):** `@playwright/mcp`, `prefersReducedMotion`, `modalState`, `reduceMotion`, `dom` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AI-Powered Lead Generation & Cold Outreach Transcript` and `Dam koto bot`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Freelance Business Automation` connect `Productivity & Meeting Tools` to `AI Freelancer Landscape`, `AI Automation Agencies`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `AI Agent` connect `AI Freelancer Landscape` to `Productivity & Meeting Tools`, `AI Automation Agencies`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `initPrompt()` (e.g. with `clearGhost()` and `updateGhost()`) actually correct?**
  _`initPrompt()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@playwright/mcp`, `prefersReducedMotion`, `modalState` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Freelancer Landscape` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
- **Should `Productivity & Meeting Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._