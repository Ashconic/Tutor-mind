import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip
} from '@mui/material';
import { Language, ExpandMore, Check } from '@mui/icons-material';
import { useTranslation } from '../i18n/LanguageContext';

export default function LanguageSelector({ variant = 'default' }) {
  const { currentLanguage, setLanguage, languages, activeLangMeta } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    setLanguage(code);
    handleClose();
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Button
        onClick={handleClick}
        size="small"
        startIcon={<Language sx={{ fontSize: 18, color: '#ec735e' }} />}
        endIcon={<ExpandMore sx={{ fontSize: 16, color: '#9b9991', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />}
        sx={{
          bgcolor: '#fffdf8',
          border: '1px solid #e6e2d9',
          borderRadius: 2,
          px: { xs: 1, sm: 1.5 },
          py: 0.6,
          color: '#20211f',
          textTransform: 'none',
          boxShadow: '0 2px 6px rgba(44,39,27,.03)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#faf0ea',
            borderColor: '#ec735e'
          }
        }}
        aria-label="Select Language"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#20211f',
            display: 'flex',
            alignItems: 'center',
            gap: 0.6
          }}
        >
          <span style={{ display: 'inline-block' }}>{activeLangMeta.name}</span>
          {activeLangMeta.code !== 'en' && (
            <Typography
              component="span"
              sx={{
                fontSize: 11,
                color: '#ec735e',
                fontWeight: 600,
                display: { xs: 'none', sm: 'inline' }
              }}
            >
              ({activeLangMeta.nativeName})
            </Typography>
          )}
        </Typography>
      </Button>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            maxHeight: 420,
            width: 230,
            borderRadius: 2.5,
            border: '1px solid #e6e2d9',
            boxShadow: '0 12px 36px rgba(44,39,27,.12)',
            bgcolor: '#fffdf8',
            p: 0.5,
            '& .MuiMenuItem-root': {
              borderRadius: 1.5,
              my: 0.3,
              px: 1.5,
              py: 0.8,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#faf0ea'
              },
              '&.Mui-selected': {
                bgcolor: '#f5ebe6',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#f2e4dc'
                }
              }
            }
          }
        }}
      >
        <Box sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid #efede6', mb: 0.5 }}>
          <Typography sx={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 1, color: '#9b9991', textTransform: 'uppercase' }}>
            INDIAN LANGUAGES
          </Typography>
        </Box>
        {languages.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <MenuItem
              key={lang.code}
              selected={isSelected}
              onClick={() => handleSelect(lang.code)}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography fontSize={13} fontWeight={isSelected ? 700 : 500} color="#20211f">
                      {lang.name}
                    </Typography>
                    <Typography fontSize={12} color={isSelected ? '#ec735e' : '#888'} fontWeight={600}>
                      {lang.nativeName}
                    </Typography>
                  </Box>
                }
              />
              {isSelected && (
                <Check sx={{ fontSize: 16, color: '#ec735e', ml: 1 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
