import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Typography, useTheme } from '@mui/material';

const ResponseDisplay = ({ response }) => {
  const theme = useTheme();

  const customComponents = {
    h1: ({ children }) => (
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 2,
          color: theme.palette.primary.main,
          fontWeight: 600
        }}
      >
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 2,
          color: theme.palette.primary.main,
          fontWeight: 600
        }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 1.5,
          color: theme.palette.primary.main,
          fontWeight: 600
        }}
      >
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography 
        variant="body1" 
        paragraph 
        sx={{ 
          mb: 2,
          lineHeight: 1.7,
          color: theme.palette.text.primary
        }}
      >
        {children}
      </Typography>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Typography 
        component="li" 
        sx={{ 
          mb: 1,
          color: theme.palette.text.primary,
          '&::marker': {
            color: theme.palette.primary.main
          }
        }}
      >
        {children}
      </Typography>
    ),
    strong: ({ children }) => (
      <Box 
        component="span" 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.primary.main
        }}
      >
        {children}
      </Box>
    ),
    em: ({ children }) => (
      <Box 
        component="span" 
        sx={{ 
          fontStyle: 'italic',
          color: theme.palette.secondary.main
        }}
      >
        {children}
      </Box>
    ),
    blockquote: ({ children }) => (
      <Box 
        sx={{ 
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          pl: 2,
          py: 1,
          my: 2,
          bgcolor: theme.palette.primary.light + '10',
          borderRadius: 1
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            fontStyle: 'italic',
            color: theme.palette.text.secondary
          }}
        >
          {children}
        </Typography>
      </Box>
    ),
    code: ({ children }) => (
      <Box 
        component="code" 
        sx={{ 
          bgcolor: theme.palette.grey[100],
          p: 0.5,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: theme.palette.primary.dark
        }}
      >
        {children}
      </Box>
    )
  };

  return (
    <Box sx={{ color: theme.palette.text.primary }}>
      <ReactMarkdown components={customComponents}>
        {response}
      </ReactMarkdown>
    </Box>
  );
};

export default ResponseDisplay;
