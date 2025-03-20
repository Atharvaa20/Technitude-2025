import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ResponseDisplay from './components/ResponseDisplay';
import { 
  Container, TextField, Button, Typography, CircularProgress, Paper,
  Box, IconButton, List, ListItem, ListItemText, Divider, Tab, Tabs,
  useTheme, alpha
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChatIcon from '@mui/icons-material/Chat';

const App = () => {
  const [mode, setMode] = useState('restaurant');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [restaurantHistory, setRestaurantHistory] = useState([]);
  const [clinicHistory, setClinicHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const sessionId = 'user123';
  const theme = useTheme();

  // Fetch chat histories on component mount and mode change
  useEffect(() => {
    fetchChatHistory('restaurant');
    fetchChatHistory('clinic');
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMode(newValue === 0 ? 'restaurant' : 'clinic');
    setResponse(''); // Clear current response
    setQuery(''); // Clear current query
    setSelectedImage(null); // Clear any selected image
  };

  const fetchChatHistory = async (historyMode) => {
    try {
      const res = await fetch(`http://localhost:8000/chat_history/${historyMode}/${sessionId}`);
      const data = await res.json();
      if (historyMode === 'restaurant') {
        setRestaurantHistory(data);
      } else {
        setClinicHistory(data);
      }
    } catch (error) {
      console.error(`Error fetching ${historyMode} chat history:`, error);
    }
  };

  const clearChatHistory = async (historyMode) => {
    try {
      await fetch(`http://localhost:8000/chat_history/${historyMode}/${sessionId}`, {
        method: 'DELETE'
      });
      if (historyMode === 'restaurant') {
        setRestaurantHistory([]);
      } else {
        setClinicHistory([]);
      }
      setResponse('');
    } catch (error) {
      console.error(`Error clearing ${historyMode} chat history:`, error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    setSelectedImage(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint = mode === 'restaurant' ? '/restaurant/query' : '/clinic/query';
      
      if (selectedImage && mode === 'restaurant') {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('request', JSON.stringify({
          query,
          session_id: sessionId
        }));
        
        endpoint = '/analyze_menu_image';
        const res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        setResponse(data.response);
      } else {
        const res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            query, 
            session_id: sessionId,
            preferences: {}
          }),
        });
        const data = await res.json();
        setResponse(data.response);
      }
      
      // Refresh chat histories
      fetchChatHistory('restaurant');
      fetchChatHistory('clinic');
      setQuery('');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const getGradientBackground = (mode) => {
    return mode === 'restaurant' 
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`;
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 2 }}>
      <Header mode={mode} setMode={setMode} />
      <Box sx={{ display: 'flex', gap: 3, mt: 3, height: 'calc(100vh - 100px)' }}>
        {/* Chat History Panel */}
        <Paper 
          elevation={3} 
          sx={{ 
            width: '35%', 
            p: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: getGradientBackground(mode),
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<RestaurantIcon />} 
              label="Restaurant" 
              sx={{ 
                '&.Mui-selected': { color: theme.palette.primary.main }
              }}
            />
            <Tab 
              icon={<LocalHospitalIcon />} 
              label="Clinic"
              sx={{ 
                '&.Mui-selected': { color: theme.palette.secondary.main }
              }}
            />
          </Tabs>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon /> Chat History
            </Typography>
            {((activeTab === 0 && restaurantHistory.length > 0) || 
              (activeTab === 1 && clinicHistory.length > 0)) && (
              <Button 
                size="small" 
                onClick={() => clearChatHistory(activeTab === 0 ? 'restaurant' : 'clinic')}
                color={activeTab === 0 ? "primary" : "secondary"}
                variant="outlined"
                sx={{ borderRadius: 20 }}
              >
                Clear History
              </Button>
            )}
          </Box>

          <List sx={{ 
            flexGrow: 1,
            overflowY: 'auto',
            px: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: activeTab === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: '4px',
              opacity: 0.8,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              opacity: 1,
            },
          }}>
            {(activeTab === 0 ? restaurantHistory : clinicHistory).map((chat, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{ 
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.background.paper, 0.9),
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: activeTab === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                    mb: 1 
                  }}
                >
                  You: {chat.user}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assistant: {chat.assistant}
                </Typography>
              </Paper>
            ))}
          </List>
        </Paper>

        {/* Main Interaction Panel */}
        <Paper 
          elevation={3} 
          sx={{ 
            width: '65%', 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: getGradientBackground(mode),
            borderRadius: 2
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h5" sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: mode === 'restaurant' ? theme.palette.primary.main : theme.palette.secondary.main
            }}>
              {mode === 'restaurant' ? <RestaurantIcon /> : <LocalHospitalIcon />}
              {mode === 'restaurant' ? 'Restaurant Assistant' : 'Clinic Assistant'}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'restaurant' 
                ? "Ask about menu items, specials, or dietary options..."
                : "Ask about appointments, doctors, or medical services..."}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  borderRadius: 2
                }
              }}
            />
            
            {/* Image Upload Section */}
            {mode === 'restaurant' && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <IconButton 
                    color="primary" 
                    component="span"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
                {selectedImage && (
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    }}
                  >
                    <Typography variant="body2">
                      {selectedImage.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setSelectedImage(null)}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || (!query && !selectedImage)}
              fullWidth
              color={mode === 'restaurant' ? 'primary' : 'secondary'}
              sx={{ 
                mb: 3,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Message'}
            </Button>
          </Box>

          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: 2,
            p: 3,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'restaurant' ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: '4px',
              opacity: 0.8,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              opacity: 1,
            },
          }}>
            {response && <ResponseDisplay response={response} />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default App;
