import React from "react";
import { Modal, Box, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SessionLinkShare from "./SessionLinkShare";
import { useTheme } from "@mui/material/styles";

interface Props {
    open: boolean;
    onClose: () => void;
    link: string;
}

const SessionLinkShareOverlay: React.FC<Props> = ({ open, onClose, link }) => {
    const theme = useTheme();
    
    return (
        <Modal 
            open={open} 
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    outline: 'none',
                }}
            >
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 4, 
                        borderRadius: 4,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        maxWidth: 400,
                        width: '90vw',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Share Session
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <SessionLinkShare link={link} size={280} />
                </Paper>
            </Box>
        </Modal>
    );
};

export default SessionLinkShareOverlay;
