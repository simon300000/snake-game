# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- Open index.html in a browser to run the game
- No build process required (pure HTML/CSS/JS)
- Use a local server to avoid CORS issues: `python -m http.server`

## Code Style Guidelines
- **JS**: ES6+ syntax, function declarations
- **Formatting**: 4-space indentation, camelCase for variables/functions
- **Naming**: Descriptive, semantic naming (e.g., gameContainer, foodElement)
- **Comments**: Use comments to explain complex logic and function purpose
- **CSS**: Use consistent class naming, group related styles
- **SVG**: Use proper namespacing when creating SVG elements
- **Error Handling**: Check for null/undefined and handle DOM element existence
- **Animation**: Use CSS transitions and animations for visual effects
- **Game Logic**: Maintain state in clear variables (e.g., gameRunning, gamePaused)
- **Color Themes**: Follow the established theme structure for new colors