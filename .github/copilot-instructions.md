# Copilot AI Agent Instructions for Theia Codebase

## Project Overview
- **Eclipse Theia** is a modular, extensible IDE platform. This monorepo contains core, extension, and example packages, including advanced AI agent integrations.
- **AI agents** are implemented as modular services (see `packages/ai-*`), each with a clear interface and prompt template system. Agents can analyze, edit, and reason about code, but some (like Architect) are read-only.

## Key Architectural Patterns
- **Packages**: All main features are in `packages/`, each as a self-contained extension (e.g., `ai-ide`, `ai-chat`, `ai-core`, `ai-editor`, etc.).
- **Agents**: Defined in `ai-core` and extended in `ai-ide`, `ai-chat`, etc. See `packages/ai-core/src/common/agent.ts` for the base interface and documentation.
- **Prompt Templates**: Each agent uses prompt templates (see `ai-ide/src/common/*prompt-template.ts`) to define its behavior and tool usage. These templates encode workflow, autonomy, and tool invocation rules.
- **Function Calls**: Agents interact with the workspace via explicit function/tool calls (never guess file content or structure). Always use provided APIs to list, read, or modify files.
- **History & Auditing**: All agent actions are recorded (see `ai-history`).

## Developer Workflows
- **Build**: Use `npm run build` at the root, or `npm run build:electron` for Electron builds. See root `package.json` and `examples/` for entry points.
- **Test**: Run `npm test` or use VS Code tasks. Some packages have their own test scripts.
- **Lint**: Use `npm run lint` or check package-level scripts.
- **Debug**: Launch via VS Code or Theia's own launch configurations. See `dev-packages/` for CLI and debugging tools.

## Project-Specific Conventions
- **Workspace Navigation**: Always start at the root, confirm paths, and use directory/file listing tools. Never assume structure from user input alone.
- **File References**: Always use workspace-relative paths in explanations and plans.
- **Autonomy**: Agents must not yield until all objectives are met (code changes, build, lint, and tests all pass). Only stop when the task is fully complete.
- **Testing**: If no relevant tests exist, create new ones using patterns from `test/` or `examples/api-samples/`.
- **Prompt Contribution**: Prompt templates are MIT-licensed and contributions are encouraged (see template headers for details).

## Integration Points
- **External APIs**: Some agents integrate with external LLMs (Anthropic, OpenAI, etc.)—see `ai-anthropic`, `ai-openai`, etc. API keys are set via preferences or environment variables.
- **Terminal/Editor Overlays**: Agents can provide overlays in the terminal or editor (see `ai-terminal`, `ai-editor`).
- **Command Registry**: The Command Chat Agent can invoke IDE commands via Theia's command registry.

## Examples
- **Agent Interface**: `packages/ai-core/src/common/agent.ts`
- **Prompt Template**: `packages/ai-ide/src/common/coder-replace-prompt-template.ts`
- **Test Agent**: `examples/api-samples/src/browser/chat/change-set-chat-agent-contribution.ts`
- **History**: `packages/ai-history/README.md`

## Best Practices
- Use only discoverable, documented patterns—do not invent new conventions.
- Reference and reuse existing code and prompt templates.
- Document all changes and plans with workspace-relative paths.
- For new agents or prompt templates, follow the structure and licensing in existing files.

---
For more, see `README.md` in each package, and the main project `README.md`.
