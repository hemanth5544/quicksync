import React from "react";
import { Box, Typography, Stack, Container, Button, Paper, Chip } from "@mui/material";
import { useSessionRepository } from "../../contexts/SessionRepositoryContext";
import Logo from "../../assets/logo.svg?react";
import BulletList from "./BulletList.tsx";
import SessionLinkShare from "../SessionLinkShare.tsx";
import { useTheme } from "@mui/material/styles";
import QrCodeIcon from "@mui/icons-material/QrCode";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import DevicesIcon from "@mui/icons-material/Devices";

const HeroSection: React.FC = () => {
    const theme = useTheme();
    const sessionRepo = useSessionRepository();

    return (
        <Box 
            sx={{ 
                position: 'relative',
                overflow: 'hidden',
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(0, 0, 0, 0) 100%)'
                    : 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, rgba(255, 255, 255, 0) 100%)',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark'
                        ? 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
                        gap: { xs: 6, lg: 8 },
                        py: { xs: 6, md: 10, lg: 12 },
                        minHeight: { xs: 'auto', lg: '85vh' },
                        alignItems: 'center',
                    }}
                >
                    {/* Left Content - Enhanced */}
                    <Box sx={{ zIndex: 1 }}>
                        {/* Brand Section */}
                        <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={2.5} 
                            mb={2}
                            sx={{ 
                                animation: 'fadeInUp 0.6s ease-out',
                                '@keyframes fadeInUp': {
                                    from: { opacity: 0, transform: 'translateY(20px)' },
                                    to: { opacity: 1, transform: 'translateY(0)' }
                                }
                            }}
                        >
                            <Logo
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    maxHeight: 48,
                                }}
                            />
                            
                        </Stack>

                        {/* Status Badge */}
                        <Chip 
                            label="No Installation Required" 
                            size="small"
                            icon={<SpeedIcon sx={{ fontSize: 16 }} />}
                            sx={{ 
                                mb: 3,
                                fontWeight: 600,
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(99, 102, 241, 0.15)' 
                                    : 'rgba(99, 102, 241, 0.1)',
                                color: theme.palette.primary.main,
                                border: `1px solid ${theme.palette.primary.main}30`,
                                animation: 'fadeInUp 0.6s ease-out 0.1s backwards',
                            }}
                        />
                        
                        {/* Main Headline */}
                        <Typography 
                            variant="h3" 
                            fontWeight={700}
                            gutterBottom
                            sx={{ 
                                mb: 2.5,
                                color: theme.palette.text.primary,
                                lineHeight: 1.2,
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
                            }}
                        >
                            Transfer Files Between Devices{' '}
                            <Box 
                                component="span" 
                                sx={{ 
                                    display: 'inline-block',
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(120deg, #818cf8 0%, #a78bfa 100%)'
                                        : 'linear-gradient(120deg, #6366f1 0%, #8b5cf6 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Instantly
                            </Box>
                        </Typography>
                        
          
                        {/* Feature Pills */}
                        <Stack 
                            direction="row" 
                            spacing={2} 
                            flexWrap="wrap" 
                            sx={{ 
                                mb: 4,
                                gap: 1.5,
                                animation: 'fadeInUp 0.6s ease-out 0.4s backwards',
                            }}
                        >
                            {[
                                { icon: <SecurityIcon sx={{ fontSize: 18 }} />, label: 'End-to-End Encrypted' },
                                { icon: <SpeedIcon sx={{ fontSize: 18 }} />, label: 'Lightning Fast' },
                                { icon: <DevicesIcon sx={{ fontSize: 18 }} />, label: 'Cross-Platform' },
                            ].map((feature, idx) => (
                                <Paper
                                    key={idx}
                                    elevation={0}
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 1,
                                        borderRadius: 3,
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.03)',
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Box sx={{ color: theme.palette.primary.main }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {feature.label}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>

                        <BulletList />

                        {/* CTA Buttons */}
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            sx={{ 
                                mt: 5,
                                animation: 'fadeInUp 0.6s ease-out 0.5s backwards',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<QrCodeIcon />}
                                onClick={() => {
                                    const shareOverlay = document.querySelector('[data-share-overlay]');
                                    if (shareOverlay) {
                                        (shareOverlay as any).click();
                                    }
                                }}
                                sx={{
                                    px: 4,
                                    py: 1.75,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                        : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                    boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Start Sharing Now
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    px: 4,
                                    py: 1.75,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderWidth: 2,
                                    borderColor: theme.palette.divider,
                                    color: theme.palette.text.primary,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderWidth: 2,
                                        borderColor: theme.palette.primary.main,
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(99, 102, 241, 0.08)'
                                            : 'rgba(99, 102, 241, 0.04)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                How It Works
                            </Button>
                        </Stack>
                    </Box>

                    {/* Right QR Code - Enhanced */}
                    <Box 
                        sx={{ 
                            display: 'flex',
                            justifyContent: { xs: 'center', lg: 'flex-end' },
                            alignItems: 'center',
                            position: 'relative',
                            animation: 'fadeInRight 0.8s ease-out 0.3s backwards',
                            '@keyframes fadeInRight': {
                                from: { opacity: 0, transform: 'translateX(40px)' },
                                to: { opacity: 1, transform: 'translateX(0)' }
                            }
                        }}
                    >
                        {/* Glow effect behind QR */}
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: theme.palette.mode === 'dark'
                                    ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                                pointerEvents: 'none',
                            }}
                        />
                        
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: 4,
                                backgroundColor: theme.palette.background.paper,
                                border: `2px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 20px 60px rgba(0,0,0,0.4)'
                                    : '0 20px 60px rgba(0,0,0,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 24px 80px rgba(0,0,0,0.5)'
                                        : '0 24px 80px rgba(0,0,0,0.12)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                }
                            }}
                        >
                            <Typography 
                                variant="overline" 
                                sx={{ 
                                    display: 'block',
                                    mb: 2,
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    letterSpacing: 1.5,
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                SCAN TO CONNECT
                            </Typography>
                            
                            <SessionLinkShare 
                                size={280} 
                                link={sessionRepo.getSessionLink()} 
                            />
                            
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    display: 'block',
                                    mt: 2,
                                    textAlign: 'center',
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                Or share the link manually
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HeroSection;