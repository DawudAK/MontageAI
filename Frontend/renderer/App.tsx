import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import AIEditorPanel from './components/AIEditorPanel';

const DemoBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjMjAyMDIwIi8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzAzMDMwIi8+CjxyZWN0IHg9IjAiIHk9IjgwIiB3aWR0aD0iOTYwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzE1MTUxNSIvPgo8cmVjdCB4PSI5NjAiIHk9IjgwIiB3aWR0aD0iOTYwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzE1MTUxNSIvPgo8cmVjdCB4PSIwIiB5PSI1ODAiIHdpZHRoPSI5NjAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMjAyMDIwIi8+CjxyZWN0IHg9Ijk2MCIgeT0iNTgwIiB3aWR0aD0iOTYwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzIwMjAyMCIvPgo8dGV4dCB4PSIyMCIgeT0iNTAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+RWRpdGluZzwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSI1MCIgZmlsbD0iI2NjYyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Bc3NlbWJseTwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSI1MCIgZmlsbD0iI2NjYyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Db2xvcjwvdGV4dD4KPHRleHQgeD0iMjMwIiB5PSI1MCIgZmlsbD0iI2NjYyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5FZmZlY3RzPC90ZXh0Pgo8dGV4dCB4PSIzNTAiIHk9IjUwIiBmaWxsPSIjY2NjIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkF1ZGlvPC90ZXh0Pgo8dGV4dCB4PSI0MjAiIHk9IjUwIiBmaWxsPSIjY2NjIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkdyaXBobWNzPC90ZXh0Pgo8dGV4dCB4PSI1MDAiIHk9IjUwIiBmaWxsPSIjY2NjIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNhcHRpb25zPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iMTEwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPlNvdXJjZTogQ2FtaW5vIEZ1ZW50ZSBDYW0gMy5tcDQ8L3RleHQ+Cjx0ZXh0IHg9Ijk4MCIgeT0iMTEwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPlByb2dyYW06IExlc3NvbjwvdGV4dD4KPHRleHQgeD0iMjAiIHk9IjYwMCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5Qcm9qZWN0OiBwYW5lbHM8L3RleHQ+Cjx0ZXh0IHg9Ijk4MCIgeT0iNjAwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkxlZHNvbjwvdGV4dD4KPHJlY3QgeD0iMTAiIHk9IjYyMCIgd2lkdGg9Ijk0MCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxNTE1MTUiLz4KPHJlY3QgeD0iOTcwIiB5PSI2MjAiIHdpZHRoPSI5NDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTUxNTE1Ii8+Cjx0ZXh0IHg9IjIwIiB5PSI2NDAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+TWVkaWEgQnJvd3NlcjwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSI2NDAiIGZpbGw9IiNjY2MiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+TGlicmFyaWVzPC90ZXh0Pgo8dGV4dCB4PSIxNzAiIHk9IjY0MCIgZmlsbD0iI2NjYyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5JbmZvPC90ZXh0Pgo8dGV4dCB4PSIyMjAiIHk9IjY0MCIgZmlsbD0iI2NjYyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5FZmZlY3RzPC90ZXh0Pgo8dGV4dCB4PSIyOTAiIHk9IjY0MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5DYW1pbm8gRnVlbnRlIENhbSAzPC90ZXh0Pgo8dGV4dCB4PSI5ODAiIHk9IjY0MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5WMTwvdGV4dD4KPHRleHQgeD0iOTgwIiB5PSI2NjAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+QTE8L3RleHQ+Cjx0ZXh0IHg9Ijk4MCIgeT0iNjgwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPlYyPC90ZXh0Pgo8dGV4dCB4PSI5ODAiIHk9IjcwMCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5BMjwvdGV4dD4KPHRleHQgeD0iOTgwIiB5PSI3MjAiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+VjMvL3RleHQ+Cjx0ZXh0IHg9Ijk4MCIgeT0iNzQwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPkEzPC90ZXh0Pgo8dGV4dCB4PSI5ODAiIHk9Ijc2MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5NaXg8L3RleHQ+Cjx0ZXh0IHg9IjEwMDAiIHk9IjY0MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj4wMDowMDoxNzowOTwvdGV4dD4KPHJlY3QgeD0iMTAwMCIgeT0iNjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBjMDAwIi8+Cjx0ZXh0IHg9IjEwMDAiIHk9Ijc2MCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj4wMDowMDoyNzoxNzwvdGV4dD4KPC9zdmc+Cg==')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
}));

const DemoContent = styled(Paper)(({ theme }) => ({
  padding: '20px',
  textAlign: 'center',
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  maxWidth: '400px',
  color: 'white',
  marginBottom: '20px',
}));

const App: React.FC = () => {
  return (
    <DemoBackground>
      <DemoContent>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Montage AI Editor Overlay
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          This demonstrates how the AI editor panel would appear when overlaid on Adobe Premiere Pro or other video editing software.
          <br /><br />
          The panel features a draggable circular button that snaps to screen edges, and expands into a full-height sidebar with AI-powered editing tools.
        </Typography>
      </DemoContent>
      
      {/* The AI Editor Panel - this will float on top */}
      <AIEditorPanel />
    </DemoBackground>
  );
};

export default App;