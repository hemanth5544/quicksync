import React, { useState } from "react";
import { 
    AppBar, 
    Toolbar, 
    IconButton, 
    Button, 
    Menu, 
    MenuItem, 
    useTheme, 
    Box, 
    Typography,
    Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import QrCodeIcon from "@mui/icons-material/QrCode";
import Logo from "../assets/quicksync.svg?react";

interface ActionBarProps {
    isSmall?: boolean;
    onNewSession: () => void;
    onClearSession: () => void;
    onShowShare?: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ isSmall, onNewSession, onClearSession, onShowShare }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleShareSession = () => {
        if (onShowShare) onShowShare();
        handleMenuClose();
    };

    const handleNewSession = () => {
        onNewSession();
        handleMenuClose();
    };

    const handleClearSession = () => {
        onClearSession();
        handleMenuClose();
    };

    return (
        <AppBar 
            position="fixed" 
            elevation={0}
            sx={{
                backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 41, 59, 0.8)' 
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                zIndex: theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
                <Box display="flex" alignItems="center" flexGrow={1} gap={2}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        <Logo 
                            style={{
                                height: 32,
                                width: 'auto',
                            }} 
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
                                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            Quick Sync
                        </Typography>
                    </Box>
                </Box>

                {isSmall ? (
                    <>
                        <IconButton 
                            color="inherit" 
                            onClick={handleMenuOpen}
                            sx={{
                                color: theme.palette.text.primary,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <MenuItem onClick={handleShareSession} sx={{ py: 1.5 }}>
                                <QrCodeIcon sx={{ mr: 1.5, fontSize: 20 }} />
                                Share Session
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleNewSession} sx={{ py: 1.5 }}>
                                <AddIcon sx={{ mr: 1.5, fontSize: 20 }} />
                                New Session
                            </MenuItem>
                            <MenuItem onClick={handleClearSession} sx={{ py: 1.5 }}>
                                <ClearIcon sx={{ mr: 1.5, fontSize: 20 }} />
                                Clear Session
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box display="flex" gap={1} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<QrCodeIcon />}
                            onClick={handleShareSession}
                            sx={{
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }}
                        >
                            Show QR
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleNewSession}
                            sx={{
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }}
                        >
                            New Session
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearSession}
                            sx={{
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    borderColor: theme.palette.error.main,
                                    backgroundColor: theme.palette.error.light + '15',
                                }
                            }}
                        >
                            Clear
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default ActionBar;
