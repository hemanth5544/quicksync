import SessionPage from "./components/SessionPage.tsx";
import { Route, Routes } from "react-router-dom";
import { SessionRepositoryProvider } from "./contexts/SessionRepositoryContext.tsx";
import { SessionRepository } from "./repositories/SessionRepository.ts";
import { MessagesRepository } from "./repositories/MessagesRepository.ts";
import { LocalStorageService } from "./services/LocalStorageService.ts";
import { MessageContentTransferService } from "./services/MessageContentTransferService.ts";
import { useMemo } from "react";
import {createTheme, CssBaseline, GlobalStyles, ThemeProvider} from "@mui/material";
import {
    makePeerConnectionService,
    makeSessionStorageService,
    makeSignalingService
} from "./servicesConfig.ts";

const sessionStorageService = makeSessionStorageService();
const localStorageService = new LocalStorageService();

const sessionRepo = new SessionRepository(
    sessionStorageService,
    localStorageService,
    (sessionId, deviceId) => {
        const signaling = makeSignalingService(sessionId, deviceId);
        const peerConn  = makePeerConnectionService(deviceId, signaling);
        const msgXfer  = new MessageContentTransferService(deviceId, peerConn);

        return new MessagesRepository(
            sessionId,
            new LocalStorageService(),
            msgXfer,
            sessionStorageService
        );
    }
);

function App() {

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: "light", 
                    primary: { 
                        main: "#6366f1", 
                        light: "#818cf8",
                        dark: "#4f46e5",
                    },
                    secondary: {
                        main: "#8b5cf6",
                        light: "#a78bfa",
                        dark: "#7c3aed",
                    },
                    background: {
                        default: "#f8fafc",
                        paper: "#ffffff",
                    },
                    text: {
                        primary: "#1e293b",
                        secondary: "#64748b",
                    },
                    divider: "#e2e8f0",
                },
                shape: {
                    borderRadius: 12,
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                },
                shadows: [
                    "none",
                    "0 1px 3px rgba(0,0,0,0.05)",
                    "0 1px 2px rgba(0,0,0,0.06)",
                    "0 1px 3px rgba(0,0,0,0.1)",
                    "0 4px 6px rgba(0,0,0,0.07)",
                    "0 10px 15px rgba(0,0,0,0.1)",
                    "0 20px 25px rgba(0,0,0,0.1)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                    "0 25px 50px rgba(0,0,0,0.15)",
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                borderRadius: 8,
                                padding: '8px 16px',
                                fontWeight: 500,
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                                },
                            },
                            contained: {
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            },
                            elevation1: {
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            },
                            elevation2: {
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            },
                            elevation3: {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            },
                        },
                    },
                },
            }),
        []
    );

    return (
        <>
            <ThemeProvider theme={theme}>
                <GlobalStyles
                    styles={{
                        "#root": {
                            width: "100%",
                            height: "100vh",
                            margin: 0,
                            padding: 0,
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                            lineHeight: "1.6",
                            fontWeight: "400",
                            colorScheme: "light",
                            fontSynthesis: "none",
                            textRendering: "optimizeLegibility",
                            webkitFontSmoothing: "antialiased",
                            mozOsxFontSmoothing: "grayscale",
                        },
                        body: {
                            margin: 0,
                            padding: 0,
                            overflowX: "hidden",
                            backgroundColor: "#f8fafc",
                        },
                    }}
                />
                <CssBaseline />
                <SessionRepositoryProvider repo={sessionRepo}>
                    <Routes>
                        <Route path="/" element={<SessionPage />} />
                        <Route path="/session/:sessionId" element={<SessionPage />} />
                    </Routes>
                </SessionRepositoryProvider>
            </ThemeProvider>
        </>
    );
}

export default App;
