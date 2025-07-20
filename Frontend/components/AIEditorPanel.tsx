import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { 
  SmartToy as AIIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  AutoAwesome as MagicIcon,
  Palette as ColorIcon,
  Speed as SpeedIcon,
  Chat as ChatIcon,
  VideoLibrary as VideoIcon,
  Audiotrack as AudioIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

interface Position {
  x: number;
  y: number;
}

const FloatingPanel = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  zIndex: 9999,
  userSelect: 'none',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
}));

const CircularButton = styled(motion.div)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  color: 'white',
  fontSize: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'scale(1.05)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const PanelContainer = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: '0px',
  minWidth: '320px',
  maxWidth: '400px',
  color: 'white',
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const FeatureButton = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '8px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
}));

const SidebarIcon = styled(motion.div)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.08)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '16px',
  color: 'white',
  fontSize: '18px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'scale(1.1)',
  },
  '&.active': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.15)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  color: 'white',
}));

const PANEL_WIDTH = 400; // Should match maxWidth in PanelContainer
const PANEL_HEIGHT = 340; // Estimate height of open panel (adjust as needed)
const CIRCLE_SIZE = 60;
const EDGE_MARGIN = 16;

const FIXED_PANEL_WIDTH = 400;
const FIXED_PANEL_HEIGHT = '100vh';
const FIXED_PANEL_TOP = 0;
const FIXED_PANEL_RIGHT = 0;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getSnappedPosition = (x: number, y: number) => {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  // Snap to left or right edge
  const snapToLeft = x + CIRCLE_SIZE / 2 < winW / 2;
  const snappedX = snapToLeft ? EDGE_MARGIN : winW - CIRCLE_SIZE - EDGE_MARGIN;
  // Clamp vertical position
  const minY = EDGE_MARGIN;
  const maxY = winH - CIRCLE_SIZE - EDGE_MARGIN;
  const snappedY = clamp(y, minY, maxY);
  return { x: snappedX, y: snappedY, snapToLeft };
};

const getClampedCirclePosition = (x: number, y: number) => {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const minX = EDGE_MARGIN;
  const minY = EDGE_MARGIN;
  const maxX = winW - CIRCLE_SIZE - EDGE_MARGIN;
  const maxY = winH - CIRCLE_SIZE - EDGE_MARGIN;
  return {
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
  };
};

const AIEditorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPinnedToLeft, setIsPinnedToLeft] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState('chat');
  const dragRef = useRef<HTMLDivElement>(null);
  const wasDragging = useRef(false);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const pinnedPosition = useRef<Position>({ x: 50, y: 50 });

  // Helper to get clamped position so open panel is always visible
  const getClampedPosition = (x: number, y: number) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    // When open, panel expands right and down from the circle's top-left
    const minX = 0;
    const minY = 0;
    const maxX = winW - PANEL_WIDTH;
    const maxY = winH - PANEL_HEIGHT;
    // Clamp so that when opened, the panel is fully visible
    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    setIsDragging(true);
    wasDragging.current = false;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    wasDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    // Center the circle under the cursor
    let newX = e.clientX - CIRCLE_SIZE / 2;
    let newY = e.clientY - CIRCLE_SIZE / 2;
    // Clamp only by the circle size
    const clamped = getClampedCirclePosition(newX, newY);
    setPosition(clamped);
  };

  // Only open if not just dragged
  const handleOpen = (e: React.MouseEvent) => {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Ensure the circle reappears at its pinned position
    setPosition(pinnedPosition.current);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Snap to edge after drag using the last mouse position
    const snapped = getSnappedPosition(lastMousePos.current.x - CIRCLE_SIZE / 2, lastMousePos.current.y - CIRCLE_SIZE / 2);
    setPosition({ x: snapped.x, y: snapped.y });
    pinnedPosition.current = { x: snapped.x, y: snapped.y }; // Store the pinned position
    setIsPinnedToLeft(snapped.snapToLeft);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // When window resizes, ensure position is still valid
  useEffect(() => {
    const handleResize = () => {
      setPosition((pos) => getClampedPosition(pos.x, pos.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    { id: 'chat', icon: <ChatIcon />, title: 'AI Chatbot', description: 'Intelligent conversation and assistance' },
    { id: 'video', icon: <VideoIcon />, title: 'Video Tools', description: 'AI-powered video editing features' },
    { id: 'audio', icon: <AudioIcon />, title: 'Audio Processing', description: 'Smart audio enhancement and editing' },
    { id: 'settings', icon: <SettingsIcon />, title: 'Settings', description: 'Configure your AI editor preferences' },
  ];

  const renderContent = () => {
    switch (selectedFeature) {
      case 'chat':
        return (
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              AI Chatbot
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Get intelligent assistance with your editing workflow
            </Typography>
            <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                "How can I improve the color grading of this scene?"
              </Typography>
            </Box>
            <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                "Suggest transitions for this sequence"
              </Typography>
            </Box>
          </Box>
        );
      case 'video':
        return (
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Video Tools
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              AI-powered video editing features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Auto Scene Detection
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Automatically detect and segment scenes
                </Typography>
              </Box>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Smart Color Grading
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  AI-powered color correction and enhancement
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      case 'audio':
        return (
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Audio Processing
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Smart audio enhancement and editing
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Noise Reduction
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Remove background noise automatically
                </Typography>
              </Box>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Voice Enhancement
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Improve voice clarity and quality
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      case 'settings':
        return (
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Configure your AI editor preferences
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  AI Model Selection
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Choose your preferred AI model
                </Typography>
              </Box>
              <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Performance Settings
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Adjust processing speed and quality
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating circle (closed state) */}
      {!isOpen && (
        <FloatingPanel
          ref={dragRef}
          style={{
            left: position.x,
            top: position.y,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <CircularButton
            key="closed"
            onClick={handleOpen}
            onMouseDown={handleMouseDown}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AIIcon />
          </CircularButton>
        </FloatingPanel>
      )}

      {/* Fixed open panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <PanelContainer
            key="open"
            initial={{ 
              x: isPinnedToLeft ? -FIXED_PANEL_WIDTH : FIXED_PANEL_WIDTH, 
              opacity: 0 
            }}
            animate={{ 
              x: 0, 
              opacity: 1 
            }}
            exit={{ 
              x: isPinnedToLeft ? -FIXED_PANEL_WIDTH : FIXED_PANEL_WIDTH, 
              opacity: 0 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              top: FIXED_PANEL_TOP,
              [isPinnedToLeft ? 'left' : 'right']: FIXED_PANEL_RIGHT,
              height: FIXED_PANEL_HEIGHT,
              width: FIXED_PANEL_WIDTH,
              zIndex: 9999,
              borderRadius: isPinnedToLeft ? '0px 16px 16px 0px' : '16px 0px 0px 16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <PanelHeader sx={{ padding: '20px 20px 0px 20px' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <AIIcon />
                <Typography variant="h6" fontWeight="600">
                  Montage AI
                </Typography>
              </Box>
              <IconButton
                onClick={handleClose}
                sx={{
                  color: 'white',
                  '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </PanelHeader>

            {/* Main content area with sidebar */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              {/* Sidebar */}
              <Box sx={{ 
                width: 70, 
                padding: '20px 15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0px 16px 16px 0px',
                marginLeft: '0px',
                height: '100%',
                paddingTop: '20px',
                paddingBottom: '20px',
                position: 'absolute',
                left: 0,
                top: 0,
              }}>
                {features.map((feature) => (
                  <SidebarIcon
                    key={feature.id}
                    className={selectedFeature === feature.id ? 'active' : ''}
                    onClick={() => setSelectedFeature(feature.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {feature.icon}
                  </SidebarIcon>
                ))}
              </Box>

              {/* Content Area */}
              <ContentArea sx={{ marginLeft: '70px', padding: '20px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </ContentArea>
            </Box>
          </PanelContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIEditorPanel; 