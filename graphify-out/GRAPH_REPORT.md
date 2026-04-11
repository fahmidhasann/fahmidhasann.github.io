# Graph Report - .  (2026-04-11)

## Corpus Check
- 19 files · ~92,168 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 156 nodes · 182 edges · 19 communities detected
- Extraction: 84% EXTRACTED · 15% INFERRED · 1% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `script.js - All Interactivity` - 9 edges
2. `Fahmid Hasan Portfolio Website` - 8 edges
3. `index.html - Main Markup File` - 7 edges
4. `Crop Yield by Crop Type (Wheat, Corn, Rice, Soy)` - 6 edges
5. `Yield by Crop Pie Chart` - 6 edges
6. `PlantDoc AI Plant Pathology Chatbot` - 5 edges
7. `Chashi Bondhu - Crop Disease Identifier App` - 5 edges
8. `Wheat Crop` - 5 edges
9. `AI Agent Node` - 5 edges
10. `GSAP + ScrollTrigger Animation Library` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Fahmid Hasan Taohid Profile Photo` --references--> `Portfolio Website`  [INFERRED]
  assets/profile-photo.jpg → index.html
- `AI-Powered Lead Generation & Cold Outreach Transcript` --references--> `Fahmid Hasan - Portfolio Owner`  [AMBIGUOUS]
  graphify-out/transcripts/Al-Powered Lead Generation & Cold Outreach.txt → QWEN.md
- `Dam Koto Bot Transcript` --references--> `Fahmid Hasan - Portfolio Owner`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt → QWEN.md
- `Portfolio Website Overview (QWEN Context)` --references--> `Fahmid Hasan Portfolio Website`  [EXTRACTED]
  QWEN.md → CLAUDE.md
- `Fahmid Hasan - Portfolio Owner` --references--> `Fahmid Hasan Portfolio Website`  [EXTRACTED]
  QWEN.md → CLAUDE.md

## Hyperedges (group relationships)
- **Core Portfolio Files Trio** — claudemd_indexhtml, claudemd_stylescss, claudemd_scriptjs [EXTRACTED 1.00]
- **CDN External Dependencies** — claudemd_particlesjs, claudemd_gsap, claudemd_typedjs, claudemd_fontawesome, claudemd_googlefonts [EXTRACTED 1.00]
- **script.js Initialize Functions** — qwenmd_initializetheme, qwenmd_toggletheme, qwenmd_initializeparticles, qwenmd_initializetextanimations, qwenmd_initializescrolleffects, qwenmd_initializenavigation, qwenmd_initializeprojectfiltering, qwenmd_initializecommandpalette, qwenmd_initializeeasteregg [EXTRACTED 1.00]
- **Portfolio Content Sections** — qwenmd_hero_section, qwenmd_projects_section, qwenmd_videos_section, qwenmd_contact_section [EXTRACTED 1.00]
- **Agriculture and AI Projects Showcase** — geminimd_drug_discovery, geminimd_chashi_bondhu, geminimd_plantdoc_chatbot [EXTRACTED 1.00]
- **AI Assistant Documentation Files for Portfolio** — qwenmd_portfolio_overview, claudemd_portfolio_website, geminimd_theme_system [INFERRED 0.75]

## Communities

### Community 0 - "Portfolio Architecture"
Cohesion: 0.09
Nodes (26): Command Palette (Cmd+K), GSAP + ScrollTrigger Animation Library, particles.js CDN Library, Fahmid Hasan Portfolio Website, script.js - All Interactivity, styles.css - All Styles, CSS Variable Theming System, Typed.js Typing Animation Library (+18 more)

### Community 1 - "JavaScript Functions"
Cohesion: 0.1
Nodes (9): activateEasterEgg(), clearProjectHideTimeout(), createConfetti(), executeCommand(), getScrollTargetTop(), revealProjectCard(), scheduleProjectHide(), scrollToSection() (+1 more)

### Community 2 - "Frontend & AI Concepts"
Cohesion: 0.13
Nodes (15): Font Awesome Icon Library, Google Fonts - Cormorant Garamond and Inter, index.html - Main Markup File, Agriculture and AI Intersection, Retrieval-Augmented Generation (RAG), Fahmid Hasan - Portfolio Owner, Chashi Bondhu - AI Crop Disease Detection, Drug Discovery ML Project (+7 more)

### Community 3 - "Cold Outreach Pipeline"
Cohesion: 0.14
Nodes (15): AI Generate Outreach Email Node, Clean HTML Data Node, AI-Powered Lead Generation & Cold Outreach Workflow Thumbnail, AI-Powered Lead Generation & Cold Outreach Automation, Filter Unsent Leads Node, Get Leads from Google Sheet Node, Groq Chat Model Node, Mark Invalid Email Node (+7 more)

### Community 4 - "DamKoto Bot"
Cohesion: 0.21
Nodes (12): AI Agent Node, Chat Interface, Chat Trigger Node, Embeddings Google Gemini, Google Gemini Chat Model, DamKoto Knowledge Base, n8n Workflow Editor, DamKoto - Dam Koto Bot (+4 more)

### Community 5 - "Crop Yield Analytics"
Cohesion: 0.47
Nodes (9): Corn Crop, Crop Yield by Crop Type (Wheat, Corn, Rice, Soy), Crop Yield Time Series (Jan–Nov), Agricultural Analytics Dashboard, Pesticide Usage Bar Chart (Jan–Nov, kg), Rice Crop, Soy Crop, Wheat Crop (+1 more)

### Community 6 - "BD Choropleth Map"
Cohesion: 0.38
Nodes (7): Bangladesh Geographic Data, Educational Statistics Bar Chart, Educational Statistics Dashboard, Educational Statistics Pie Chart, Bangladesh Choropleth Map Project, Search Interface UI, Bangladesh District-Level Choropleth Map

### Community 7 - "PlantDoc Chatbot"
Cohesion: 0.47
Nodes (6): AI Chatbot Interface, Conversational UI Design, Leaf Disease Detection, Plant Pathology / Disease Identification, PlantDoc Chatbot Project Image, PlantDoc AI Plant Pathology Chatbot

### Community 8 - "Chashi Bondhu App"
Cohesion: 0.47
Nodes (6): Agricultural Technology Domain, Chashi Bondhu - Crop Disease Identifier App, Bengali Language Support, Crop Disease Detection Feature, Leaf Visual Analysis with Magnification, Chashi Bondhu Mobile UI Screen

### Community 9 - "Bikrom Creative Project"
Cohesion: 0.7
Nodes (5): Bengali Script Title Text - Bikrom, Bikrom - Bengali Short Film or Music Video, Project 2 Image - Bikrom Short Film Thumbnail, Person Wearing Earphones and Disturbed Hoodie, Silhouette of Person Against Sunset

### Community 10 - "Drug Discovery ML"
Cohesion: 0.7
Nodes (5): 2D Chemical Structures, Acetylcholinesterase Enzyme Inhibition, Computational Drug Discovery Pipeline, Molecular Descriptors (logP), Random Forest ML Model

### Community 11 - "Potato Disease Detector"
Cohesion: 0.5
Nodes (5): Potato Disease Detector, Diseased Potato Leaf, Healthy Potato Leaf, Image Classification (Healthy vs Diseased), Potato Disease Detector Project Image

### Community 12 - "Project Filtering"
Cohesion: 0.67
Nodes (4): Project Category Filtering, data-category HTML Attribute Filter Pattern, Project Filtering Mechanism Detail, initializeProjectFiltering() Function

### Community 13 - "Author Lifestyle Photos"
Cohesion: 0.67
Nodes (4): Project 3 Photo - Man Selfie in Corridor, Covered Walkway or Corridor, Motion Blur Selfie Photography, Young Man (Portfolio Author)

### Community 14 - "Agricultural University"
Cohesion: 0.83
Nodes (4): Bangladesh Agricultural University, Project 1 Portfolio Image, Red University Building, Liberation War Monument / Sculpture

### Community 15 - "VocabFlow App"
Cohesion: 1.0
Nodes (3): Brand Identity - Blue V Letter Mark, VocabFlow Logo Design, VocabFlow Project Thumbnail

### Community 16 - "Easter Egg Feature"
Cohesion: 1.0
Nodes (2): Easter Egg - Konami Code Confetti, initializeEasterEgg() Function (Konami Code)

### Community 17 - "Profile Identity"
Cohesion: 1.0
Nodes (2): Fahmid Hasan Taohid Profile Photo, Portfolio Website

### Community 18 - "Navigation"
Cohesion: 1.0
Nodes (1): initializeNavigation() Function

## Ambiguous Edges - Review These
- `AI-Powered Lead Generation & Cold Outreach Transcript` → `Fahmid Hasan - Portfolio Owner`  [AMBIGUOUS]
  graphify-out/transcripts/Al-Powered Lead Generation & Cold Outreach.txt · relation: references
- `Dam Koto Bot Transcript` → `Fahmid Hasan - Portfolio Owner`  [AMBIGUOUS]
  graphify-out/transcripts/Dam koto bot.txt · relation: references

## Knowledge Gaps
- **38 isolated node(s):** `Font Awesome Icon Library`, `Google Fonts - Cormorant Garamond and Inter`, `Vercel Deployment via GitHub Push`, `Portfolio Website Overview (QWEN Context)`, `toggleTheme() Function` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Easter Egg Feature`** (2 nodes): `Easter Egg - Konami Code Confetti`, `initializeEasterEgg() Function (Konami Code)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Profile Identity`** (2 nodes): `Fahmid Hasan Taohid Profile Photo`, `Portfolio Website`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navigation`** (1 nodes): `initializeNavigation() Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AI-Powered Lead Generation & Cold Outreach Transcript` and `Fahmid Hasan - Portfolio Owner`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Dam Koto Bot Transcript` and `Fahmid Hasan - Portfolio Owner`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `script.js - All Interactivity` connect `Portfolio Architecture` to `Project Filtering`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Fahmid Hasan Portfolio Website` connect `Portfolio Architecture` to `Frontend & AI Concepts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `index.html - Main Markup File` connect `Frontend & AI Concepts` to `Portfolio Architecture`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `Font Awesome Icon Library`, `Google Fonts - Cormorant Garamond and Inter`, `Vercel Deployment via GitHub Push` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Portfolio Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._