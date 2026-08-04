# AGENTS.md - SIM RW 047 (VERSI 2)

## Project Overview
Sistem Informasi Manajemen (SIM) RW 047 berbasis Laravel 10, MySQL 8, n8n, dan Google Gemini API.

## Core Rules for AI Agents
1. Refer to `.agents/rules/project_context.md` for full project architecture, completed modules, backlog, and guidelines.
2. Protect the Lock: `LedgerService.php`, `ContributionService.php`, and Financial migrations/models are **FROZEN & LOCKED**.
3. Follow Thin Controller & Service Layer pattern.
4. AI integration must be non-blocking, asynchronous (Event/Listener), and fallback-safe.
5. All database modifications must go through Laravel (MySQL is Source of Truth).
