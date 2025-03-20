import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  useTheme,
  alpha,
  Box
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const Header = ({ mode, setMode }) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'transparent',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h5" component="div" sx={{ 
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GenAI Assistant
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => newMode && setMode(newMode)}
          aria-label="mode selection"
          sx={{
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '20px !important',
              mx: 0.5,
              px: 3,
              py: 1,
              color: 'text.secondary',
              '&.Mui-selected': {
                backgroundColor: alpha(
                  mode === 'restaurant' ? theme.palette.primary.main : theme.palette.secondary.main,
                  0.1
                ),
                color: mode === 'restaurant' ? theme.palette.primary.main : theme.palette.secondary.main,
              },
              '&:hover': {
                backgroundColor: alpha(
                  mode === 'restaurant' ? theme.palette.primary.main : theme.palette.secondary.main,
                  0.05
                ),
              }
            }
          }}
        >
          <ToggleButton 
            value="restaurant" 
            aria-label="restaurant mode"
            sx={{ 
              display: 'flex', 
              gap: 1,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            <RestaurantIcon />
            Restaurant
          </ToggleButton>
          <ToggleButton 
            value="clinic" 
            aria-label="clinic mode"
            sx={{ 
              display: 'flex', 
              gap: 1,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            <LocalHospitalIcon />
            Clinic
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
