import React from "react";
import { Container, Stack, Typography, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Step1 from "../../assets/step1.svg?react";
import Step2 from "../../assets/step2.svg?react";
import Step3 from "../../assets/step3.svg?react";

const UsageSteps: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const steps = [
    {
      svg: <Step1 />,
      caption: "Open QuickSync on your PC",
      number: "01",
    },
    {
      svg: <Step2 />,
      caption: "Scan QR code with your phone",
      number: "02",
    },
    {
      svg: <Step3 />,
      caption: "Start sharing text, files, and links",
      number: "03",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          How It Works
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
          Three simple steps to start sharing between your devices
        </Typography>
      </Box>

      <Stack
        direction={isMobile ? "row" : "row"}
        spacing={4}
        justifyContent="center"
        sx={{
          overflowX: isMobile ? "auto" : "visible",
          pb: isMobile ? 2 : 0,
          px: isMobile ? 2 : 0,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: "2px",
              bgcolor: theme.palette.divider,
              zIndex: 0,
            }}
          />
        )}

        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              minWidth: isMobile ? 280 : 320,
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 20px 40px rgba(0,0,0,0.5)"
                    : "0 20px 40px rgba(0,0,0,0.12)",
                  borderColor: "primary.main",
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  mx: "auto",
                  mb: 4,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {step.number}
              </Box>

              <Box
                sx={{
                  mb: 4,
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": {
                    width: "100%",
                    maxWidth: 220,
                    height: "auto",
                    transition: "transform 0.3s ease",
                  },
                  "&:hover svg": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {step.svg}
              </Box>

              {/* Caption */}
              <Typography variant="h6" fontWeight={600} component="div">
                {step.caption}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default UsageSteps;