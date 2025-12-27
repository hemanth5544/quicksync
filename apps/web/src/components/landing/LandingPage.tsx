import React from "react";
import { Box } from "@mui/material";
import HeroSection from "./HeroSection.tsx";
import UsageSteps from "./UsageSteps.tsx";
import FooterSection from "../FooterSection.tsx";
import { useTheme } from "@mui/material/styles";

const LandingPage: React.FC = () => {
    const theme = useTheme();
    
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <HeroSection />
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.3)'
                        : 'rgba(248, 250, 252, 0.5)',
                    py: 8,
                }}
            >
                <UsageSteps />
            </Box>
            <FooterSection />
        </Box>
    );
};

export default LandingPage;
