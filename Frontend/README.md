# Montage AI Editor

A modern AI-powered overlay editor for video editing platforms like Premiere Pro, CapCut, and others.

## Features

- 🎯 **Draggable Circular Button**: When closed, the panel appears as a draggable circular button
- ✨ **Frosted Glass Effects**: Modern glassmorphism design with backdrop blur
- 🎨 **Smooth Animations**: Fluid transitions between closed and open states
- 🔧 **Expandable Panel**: Click to expand into a full-featured rectangular panel
- 📱 **Always-on-Top**: Designed to overlay on top of existing video editing software
- 🎪 **AI Features**: Ready for AI-powered editing tools integration

## Tech Stack

- **React 18** with TypeScript
- **Material-UI** for components
- **Framer Motion** for animations
- **Electron** for desktop app
- **Vite** for fast development

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd montage-ai-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. In a separate terminal, start the Electron app:
```bash
npm run electron-dev
```

Or run both together:
```bash
npm run electron-dev
```

## Development

### Project Structure

```
src/
├── renderer/          # React frontend
│   ├── components/    # React components
│   │   └── AIEditorPanel.tsx  # Main overlay panel
│   ├── App.tsx       # Main app component
│   └── index.tsx     # React entry point
└── main/             # Electron main process (future)
```

### Key Components

#### AIEditorPanel
The main overlay component that provides:
- Circular closed state with draggable functionality
- Rectangular open state with AI features
- Frosted glass effects with backdrop blur
- Smooth animations using Framer Motion

### Customization

The panel can be easily customized by modifying:
- Colors and styling in the styled components
- Animation parameters in Framer Motion
- Feature buttons and their functionality
- Panel size and positioning

## Building for Production

```bash
npm run build
npm run electron-pack
```

## Usage as Overlay

This component is designed to be used as an overlay on top of existing video editing software:

1. The panel stays on top of other applications
2. Draggable when in circular mode
3. Expandable to show AI editing tools
4. Non-intrusive design that doesn't block the main editing interface

## Future Enhancements

- [ ] Backend integration for AI features
- [ ] Real-time video processing
- [ ] Custom AI model integration
- [ ] Plugin system for different editing platforms
- [ ] Settings and preferences panel
- [ ] Keyboard shortcuts support

## License

MIT License - see LICENSE file for details 