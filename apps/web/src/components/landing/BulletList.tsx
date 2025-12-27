import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const BulletList: React.FC = () => {
    const theme = useTheme();
    const bullets = [
    "Send files and links instantly between your devices",
    "Connect in seconds with a quick scan",
    "No apps. No accounts. Just share",
    ];


    return (
        <Stack spacing={2} sx={{ mt: 2 }}>
            {bullets.map((text, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                    }}
                >
                    <CheckCircle
                        sx={{
                            color: theme.palette.primary.main,
                            fontSize: 24,
                            mt: 0.25,
                            flexShrink: 0,
                        }}
                    />
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                    >
                        {text}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
};

export default BulletList;
