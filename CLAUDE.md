# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This project follows the team's standard AI instruction set — four version-controlled `.md` files, per the *AI Workflows* task in
Asana. **`AGENTS.md` is the entry point and is imported below.** The rest are deliberately not preloaded; read them when the work
calls for it, which is the point of splitting them.

@AGENTS.md

## Read on demand

| File | When |
|---|---|
| `ARCHITECTURE.md` | Before searching the tree. Module map, routes, design system, SEO layer, navbar internals, dependencies |
| `WORKFLOW.md` | Before starting a change. Investigation, planning, implementation, the verification gates, what to report |
| `QUALITY_AND_SAFETY.md` | Before review, and any time a change touches security, SEO, accessibility, or data |

`next dev` appends a `nextjs-agent-rules` block to `AGENTS.md` on every run and recreates this file if it is missing. Leave that
block alone and commit it — deleting it only re-creates the diff.
