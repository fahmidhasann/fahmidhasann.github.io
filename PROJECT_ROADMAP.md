# Portfolio Project Roadmap

## Current Projects — Keep, Replace, or Remove

| Project | Decision | Reason |
|---|---|---|
| Cold Outreach Automation | **Keep** | Directly proves the $599 automation service. Best proof of work you have. |
| DamKoto Bot | **Keep** | Your strongest project. Real business scenario, video demo, multilingual. |
| VocabFlow | **Keep** | Shows full-stack capability. Supports the $1,499 MVP service. |
| Chashi Bondhu | **Replace** | Agriculture + Bangladesh niche. International clients cannot relate to it. |
| PlantDoc RAG ChatBot | **Replace** | Same agriculture niche. Having two of six projects in the same narrow domain looks repetitive. |
| Bangladesh Choropleth Map | **Replace** | Academic data visualization. Not connected to any of your four services. |

---

## New Projects to Build

---

### Project 1 — Appointment Booking Bot
**Replaces:** Bangladesh Choropleth Map

**What it does:**
A user messages on WhatsApp or Telegram → the bot checks available time slots via Cal.com → confirms the booking → sends a reminder before the appointment. Fully automated, no human needed.

**Who it is for:** Dental clinics, salons, physiotherapists, and any service business that still books appointments manually or through phone calls.

**Why it matters for your portfolio:** Your chatbot service already lists "WhatsApp / Telegram channel" as a deliverable, but you have no demo of it. This closes that gap directly.

**Stack:** n8n + Telegram Bot API (or Twilio for WhatsApp) + Cal.com API

**Time to build:** 3–5 days

**How to present it on the site:**
> "Books appointments 24/7 via WhatsApp or Telegram — zero staff involvement, instant confirmations."

---

### Project 2 — Invoice & Document Processing Automation
**Replaces:** Chashi Bondhu

**What it does:**
A PDF invoice or receipt is uploaded (via email attachment or a form) → n8n sends it to an LLM → the LLM extracts vendor name, amount, date, and line items → the data is written to a Google Sheet row → a summary email is sent automatically.

**Who it is for:** Small business owners, accountants, and operations teams who currently copy invoice data by hand into spreadsheets.

**Why it matters for your portfolio:** This is the single most common pain point for SMBs. It is an immediately relatable demo — every business owner has seen this problem. Directly sells the $599 automation package.

**Stack:** n8n + Groq or OpenAI + Google Sheets + Gmail

**Time to build:** 2–4 days

**How to present it on the site:**
> "Extracts invoice data from PDFs automatically — vendor, amount, date, line items — directly into your spreadsheet. No manual entry."

---

### Project 3 — E-commerce Order Support Chatbot
**Replaces:** PlantDoc RAG ChatBot

**What it does:**
A customer types "Where is my order?" or "What is your return policy?" → the chatbot searches order data and a knowledge base using RAG → gives a direct answer → escalates to a human agent if it cannot resolve the issue.

**Who it is for:** Any online store that receives repetitive support questions about orders, shipping, and returns.

**Why it matters for your portfolio:** DamKoto Bot is a great project but it is designed for a Bangladeshi market with Bangla language. International clients need to see a universal version. This strengthens the $799 chatbot service with a second, globally relatable demo.

**Stack:** n8n or Python + Groq/OpenAI + Supabase vector store + Shopify API (or mock order data)

**Time to build:** 5–7 days

**How to present it on the site:**
> "Handles order tracking, return queries, and policy questions automatically — resolves 40–60% of support tickets without a human agent."

---

### Project 4 — Lead Qualification & CRM Bot
**Replaces:** Nothing — this is a new addition

**What it does:**
A prospect submits a contact form or replies to an outreach email → an LLM reads the message and scores the lead on budget, timeline, and fit → the lead is added to Airtable or Google Sheets with a score and a one-line summary → a personalized follow-up email is sent automatically if the lead scores above a threshold.

**Who it is for:** Agencies, consultants, and sales teams who receive too many leads to follow up on all of them manually.

**Why it matters for your portfolio:** You already have the Cold Outreach Automation project, which handles sending emails. This project completes the full sales funnel story — from sending outreach to qualifying who responds. Together they show end-to-end automation of the sales process.

**Stack:** n8n + Groq + Airtable or Google Sheets + Gmail

**Time to build:** 3–4 days

**How to present it on the site:**
> "Scores every inbound lead automatically — budget, timeline, fit — so your team only spends time on the warm ones."

---

## Final Portfolio After All Changes

| # | Project | Category | Status |
|---|---|---|---|
| 1 | Appointment Booking Bot | Automation | Build → replace Choropleth Map |
| 2 | Invoice Processing Automation | Automation | Build → replace Chashi Bondhu |
| 3 | E-commerce Order Support Chatbot | Automation | Build → replace PlantDoc RAG |
| 4 | Lead Qualification & CRM Bot | Automation | Build → add as new project |
| 5 | AI-Powered Cold Outreach Automation | Automation | Already on site — keep |
| 6 | DamKoto Bot | Automation | Already on site — keep |
| 7 | VocabFlow | AI & ML | Already on site — keep |

---

## Day-by-Day Plan

| Day | Task |
|---|---|
| Day 1–2 | Build Appointment Booking Bot |
| Day 3 | Record a 2–3 min video demo. Add project card to site. Remove Choropleth Map. |
| Day 4–5 | Build Invoice Processing Automation |
| Day 6 | Record demo. Add project card to site. Remove Chashi Bondhu. |
| Day 7–10 | Build E-commerce Order Support Chatbot |
| Day 11 | Record demo. Add project card to site. Remove PlantDoc RAG. |
| Day 12–14 | Build Lead Qualification & CRM Bot |
| Day 15 | Record demo. Add as new project card to site. |
| Day 16 | Review full portfolio. Reorder cards so automation projects appear first. |

---

## Rules to Follow While Building

- Each project must have a **video demo** before it goes on the site. Screenshots alone do not convert clients.
- Each project card description must include **one sentence with a measurable outcome** — "saves X hours", "handles Y% of queries", "processes in seconds not hours."
- Use **real or realistic mock data** in demos, not placeholder text. It makes the project feel production-ready.
- After each project is added, ask yourself: "If a client saw only this project, would they want to hire me?" If no, improve the demo or description before moving on.
