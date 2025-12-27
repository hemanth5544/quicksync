import React, { useState } from "react";
import { Box, TextField, IconButton, InputAdornment, Stack, Paper, Snackbar, Alert } from "@mui/material";
import QRCode from "react-qr-code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface SessionLinkShareProps {
    size?: number;
    link: string;
    onCopy?: (link: string) => void;
    onShare?: (link: string) => void;
}

const SessionLinkShare: React.FC<SessionLinkShareProps> = ({ size = 200, link, onCopy, onShare }) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    const handleCopy = () => {
        if (onCopy) {
            onCopy(link);
            return;
        }

        navigator.clipboard.writeText(link)
            .then(() => {
                setCopied(true);
                setShowSnackbar(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(console.error);
    };

    const handleShare = () => {
        if (onShare) {
            onShare(link);
            return;
        }

        if (navigator.share) {
            navigator
                .share({ url: link })
                .catch((err) => console.warn("Share failed:", err));
        } else {
            handleCopy();
        }
    };

    return (
        <>
            <Stack direction="column" alignItems="center" spacing={2}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: "white",
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 20px rgba(0,0,0,0.3)'
                            : '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                >
                    <QRCode 
                        value={link} 
                        size={size ?? 200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </Paper>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={link}
                    slotProps={{
                        htmlInput: {
                            readOnly: true,
                        },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={handleCopy} 
                                        edge="end" 
                                        aria-label="copy link"
                                        color={copied ? "success" : "default"}
                                        sx={{ mr: 0.5 }}
                                    >
                                        {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                    </IconButton>
                                    <IconButton 
                                        onClick={handleShare} 
                                        edge="end" 
                                        aria-label="share link"
                                    >
                                        <ShareIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ 
                        mt: 1,
                        maxWidth: size ? size + 40 : 240,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
            </Stack>
            <Snackbar
                open={showSnackbar}
                autoHideDuration={2000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setShowSnackbar(false)}>
                    Link copied to clipboard!
                </Alert>
            </Snackbar>
        </>
    );
};

export default SessionLinkShare;
