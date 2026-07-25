# Graph Report - workspace  (2026-07-25)

## Corpus Check
- 21 files · ~248,579 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 311 nodes · 433 edges · 31 communities (19 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f94fd890`
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
- rules
- csp.spec.js
- playwright.config.js
- visual-check.mjs
- DamKoto Transcript
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `run()` - 17 edges
2. `rules` - 16 edges
3. `Ashley Allen (freelance developer)` - 15 edges
4. `Project Management Automation` - 11 edges
5. `openDialog()` - 10 edges
6. `scripts` - 9 edges
7. `motionReduced()` - 9 edges
8. `closeDialog()` - 9 edges
9. `initPrompt()` - 9 edges
10. `Freelance Business Automation` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Dam koto bot` --conceptually_related_to--> `AI-Powered Lead Generation & Cold Outreach Transcript`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt → graphify-out/transcripts/Al-Powered Lead Generation & Cold Outreach.txt

## Import Cycles
- None detected.

## Communities (31 total, 12 thin omitted)

### Community 0 - "AI Freelancer Landscape"
Cohesion: 0.11
Nodes (24): AI Agent, AI Cannot Replace Developers, AI Hallucination Problem, AI-Driven Layoffs, AI Tool, Ashley Allen (freelance developer), Battle Ready Laravel (book), ChatGPT (+16 more)

### Community 1 - "Portfolio Projects & Stack"
Cohesion: 0.50
Nodes (4): Agentic Workflow Concept, AI Agents vs Traditional Automation, AI Agents vs Traditional Dev Tools, Traditional Structured Workflow

### Community 3 - "Productivity & Meeting Tools"
Cohesion: 0.07
Nodes (35): AI Automation Stack for Freelancers, Asana, Calendly, ClickUp, Client Acquisition Automation, Commission-Free Freelance Platform, Content Marketing Automation, Contract Management Automation (+27 more)

### Community 4 - "AI Automation Agencies"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, globals, html-validate, description, devDependencies, eslint, @eslint/js (+21 more)

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
Cohesion: 0.09
Nodes (46): activateEasterEgg(), cancelPendingDialogFocus(), clearPageInert(), closeActiveDialog(), closeCommandPalette(), closeDialog(), closeEditionChooser(), closeMobileMenu() (+38 more)

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
Cohesion: 0.09
Nodes (21): graphify-out/**, node_modules/**, stylelint-config-standard, extends, ignoreFiles, rules, alpha-value-notation, color-function-alias-notation (+13 more)

### Community 22 - "script.js"
Cohesion: 0.09
Nodes (50): applyFilter(), clearConsole(), clearGhost(), clearPageInert(), closeDemo(), currentTheme(), demoSlugs(), focusPrompt() (+42 more)

### Community 23 - "rules"
Cohesion: 0.24
Nodes (9): extends, rules, aria-label-misuse, attribute-boolean-style, prefer-native-element, require-sri, void-style, error (+1 more)

### Community 29 - "AGENTS.md"
Cohesion: 0.10
Nodes (15): Architecture, Command Palette, Creative Work, Development, graphify, Overview, Project Filtering, Theming (+7 more)

## Ambiguous Edges - Review These
- `AI-Powered Lead Generation & Cold Outreach Transcript` → `Dam koto bot`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt · relation: conceptually_related_to

## Knowledge Gaps
- **112 isolated node(s):** `html-validate:recommended`, `void-style`, `attribute-boolean-style`, `@playwright/mcp`, `extends` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AI-Powered Lead Generation & Cold Outreach Transcript` and `Dam koto bot`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Freelance Business Automation` connect `Productivity & Meeting Tools` to `AI Freelancer Landscape`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `AI Agent` connect `AI Freelancer Landscape` to `Productivity & Meeting Tools`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `html-validate:recommended`, `void-style`, `attribute-boolean-style` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Freelancer Landscape` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
- **Should `Productivity & Meeting Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.06722689075630252 - nodes in this community are weakly interconnected._
- **Should `AI Automation Agencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._