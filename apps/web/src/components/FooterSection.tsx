import React from "react";
import { Box, IconButton, Link, Tooltip, Typography, Container, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTheme } from "@mui/material/styles";

interface FooterLink {
    href: string;
    label: string;
    tooltip: string;
    icon: React.ReactNode;
}




const footerLinks: FooterLink[] = [
    {
        href: "https://github.com/hemanth5544/quicksync",
        label: "GitHub",
        tooltip: "Quick Sync on GitHub",
        icon: <GitHubIcon />,
    },
    {
        href: "https://github.com/hemanth5544/quicksync",
        label: "Dev",
        tooltip: "Contact Developerr",
        icon: <GitHubIcon/>
    }

  
];

const FooterSection: React.FC = () => {
    const theme = useTheme();
    
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                mt: 'auto',
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Container maxWidth="lg">
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2} 
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {footerLinks.map((link) => (
                            <Tooltip key={link.href} title={link.tooltip} arrow>
                                <IconButton
                                    component="a"
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    size="small"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: theme.palette.primary.main,
                                            backgroundColor: theme.palette.primary.main + '10',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {link.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Box>

                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ textAlign: { xs: "center", sm: "right" } }}
                    >
                        &copy; {new Date().getFullYear()} Quick Sync •{" "}
                        <Link 
                            href="/LICENSE" 
                            underline="hover"
                            sx={{ 
                                color: 'inherit',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            MIT License
                        </Link>
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
};

export default FooterSection;
