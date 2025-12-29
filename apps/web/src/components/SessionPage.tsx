// src/components/SessionPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Paper,
    Stack,
    Typography,
    useMediaQuery,
    Avatar,
    Chip,
    Fade,
    Drawer,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { downloadFile } from "../utils/fileUtils.ts";
import { FileMessage, MessageStatusType, MessageType, TextMessage } from "../models/Message";
import { useMessages } from "../hooks/useMessages";
import { useSessionRepository } from "../contexts/SessionRepositoryContext";
import { useDevices } from "../hooks/useDevices";
import MessageComponent from "./MessageComponent";
import MessageInput from "./MessageInput";
import LandingPage from "./landing/LandingPage.tsx";
import ActionBar from "./ActionBar.tsx";
import SessionLinkShareOverlay from "./SessionLinkShareOverlay";
import { useTheme } from "@mui/material/styles";
import FooterSection from "./FooterSection.tsx";
import SessionLoading from "./SessionLoading.tsx";
import PersonIcon from "@mui/icons-material/Person";
import DevicesIcon from "@mui/icons-material/Devices";

const SIDEBAR_WIDTH = 280;

const SessionPage: React.FC = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("md"));

    const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const sessionRepo = useSessionRepository();
    const [isInitialized, setIsInitialized] = useState(false);
    const messages = useMessages(sessionRepo);
    const devices = useDevices(sessionRepo);
    const [messageInput, setMessageInput] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [shareOpen, setShareOpen] = useState(false);
    const [qrOverlayOpen, setQrOverlayOpen] = useState(true); 

    // Show QR code overlay only if there's only one device (waiting for connection)
    // Once 2+ devices are connected, hide the overlay automatically
    const showQRCode = devices.length < 2;
    
    useEffect(() => {
        if (devices.length >= 2) {
            setQrOverlayOpen(false);
        } else if (devices.length < 2 && isInitialized) {
            // Show overlay when waiting for connection (but don't force it if user dismissed it)
            // Only auto-show on initial load or when going back to waiting state
        }
    }, [devices.length, isInitialized]);

    useEffect(() => {
        let cancelled = false;
        sessionRepo
            .initializeSession((url) => navigate(url, { replace: true }), urlSessionId)
            .then(() => {
                if (!cancelled) {
                    console.log('[SessionPage] Session initialized');
                    setIsInitialized(true);
                }
            })
            .catch((error) => {
                console.error('[SessionPage] Error initializing session:', error);
                if (!cancelled) {
                    setIsInitialized(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [sessionRepo, navigate, urlSessionId]);

    if (!isInitialized) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SessionLoading />
            </Box>
        );
    }

    const onSendMessagePressed = async () => {
        if (!sessionRepo.getSessionId()) return;

        for (const file of attachments) {
            const newFileMessage: FileMessage = {
                id: uuidv4(),
                type: MessageType.FILE,
                sender: sessionRepo.getDeviceId(),
                senderName: sessionRepo.getDeviceName(),
                sentAt: sessionRepo.createTimestamp(),
                status: { type: MessageStatusType.LOADED },
                blob: file,
                filename: file.name,
                fileSize: file.size,
            };
            try {
                await sessionRepo.sendMessage(newFileMessage);
            } catch (error) {
                console.error("Error sending file:", error);
            }
        }

        if (messageInput.trim()) {
            const newTextMessage: TextMessage = {
                id: uuidv4(),
                type: MessageType.TEXT,
                sender: sessionRepo.getDeviceId(),
                senderName: sessionRepo.getDeviceName(),
                sentAt: sessionRepo.createTimestamp(),
                text: messageInput,
                status: { type: MessageStatusType.LOADED },
            };
            try {
                await sessionRepo.sendMessage(newTextMessage);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }

        setMessageInput("");
        setAttachments([]);
    };

    const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);
        if (!file) return;
        setAttachments((prev) => [...prev, file]);
    };

    const onDownloadFileClicked = async (msg: FileMessage) => {
        try {
            try {
                const blob = await sessionRepo.getOrRetrieveFile(msg);
                if (blob) downloadFile(msg.filename, blob);
                else throw new Error("No file downloaded");
            } catch (e) {
                console.error("Error retrieving file:", e);
                throw e;
            }
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const copyToClipboard = (text?: string) => {
        if (!text) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch((err) =>
                console.warn("Clipboard API failed, using fallback", err)
            );
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Copied to clipboard!");
        }
    };

    const handleNewSession = () => {
        setIsInitialized(false);
        sessionRepo.newSession(url => window.location.href = url, uuidv4()).then(() => setIsInitialized(true));
    };

    const handleClearSession = () => {
        setIsInitialized(false);
        sessionRepo.newSession(url => window.location.href = url, sessionRepo.getSessionId()).then(() => setIsInitialized(true));
    };

    if (sessionRepo.getIsLandingPage()) {
        return <LandingPage />;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: theme.palette.background.default }}>
            <ActionBar
                isSmall={isSmall}
                onNewSession={handleNewSession}
                onClearSession={handleClearSession}
                onShowShare={() => {
                    if (showQRCode) {
                        setQrOverlayOpen(true);
                    } else {
                        setShareOpen(true);
                    }
                }}
            />
            
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', mt: 8 }}>
                {/* Left Sidebar - Connected Devices */}
                <Paper
                    elevation={0}
                    sx={{
                        width: isSmall ? 0 : SIDEBAR_WIDTH,
                        display: isSmall ? 'none' : 'flex',
                        flexDirection: 'column',
                        borderRadius: 0,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <DevicesIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Connected Devices
                            </Typography>
                            <Chip 
                                label={devices.length} 
                                size="small" 
                                color="primary"
                                sx={{ ml: 'auto' }}
                            />
                        </Stack>
                    </Box>
                    
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                        <Stack spacing={1.5}>
                            {devices.map((device) => {
                                const isCurrent = sessionRepo.getDeviceId() === device.id;
                                return (
                                    <Fade in key={device.id}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: isCurrent 
                                                    ? theme.palette.primary.main + '15' 
                                                    : 'transparent',
                                                border: isCurrent 
                                                    ? `2px solid ${theme.palette.primary.main}` 
                                                    : `1px solid ${theme.palette.divider}`,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                },
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: isCurrent 
                                                        ? theme.palette.primary.main 
                                                        : theme.palette.grey[500],
                                                    width: 44,
                                                    height: 44,
                                                }}
                                            >
                                                <PersonIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body1" fontWeight={500} noWrap>
                                                    {device.name}
                                                </Typography>
                                                {isCurrent && (
                                                    <Chip 
                                                        label="You" 
                                                        size="small" 
                                                        color="primary"
                                                        sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Fade>
                                );
                            })}
                        </Stack>
                    </Box>
                </Paper>

                {/* Mobile Drawer for Devices */}
                <Drawer
                    anchor="left"
                    open={false}
                    variant="temporary"
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {/* Same content as sidebar */}
                </Drawer>

                {/* Main Content Area - Chat Interface */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* QR Code Overlay (shown only when waiting for connection, dismissible) */}
                    {showQRCode && qrOverlayOpen && (
                        <Box
                            onClick={() => setQrOverlayOpen(false)}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1000,
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 3,
                                cursor: 'pointer',
                            }}
                        >
                            <Paper
                                elevation={0}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    maxWidth: 420,
                                    width: '100%',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    cursor: 'default',
                                }}
                            >
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Waiting for Connection
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Scan the QR code with another device to join this session
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(sessionRepo.getSessionLink())}`}
                                        alt="QR Code"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                    />
                                </Box>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        display: 'block',
                                        wordBreak: 'break-all',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {sessionRepo.getSessionLink()}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        display: 'block',
                                        mt: 2,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    Click outside to dismiss
                                </Typography>
                            </Paper>
                        </Box>
                    )}

                    {/* Messages Area */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 0,
                            backgroundColor: theme.palette.background.paper,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        {/* Messages List */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.divider,
                                    borderRadius: '4px',
                                    '&:hover': {
                                        backgroundColor: theme.palette.text.secondary,
                                    },
                                },
                            }}
                        >
                            {messages.length === 0 ? (
                                <Box
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        gap: 2,
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                        No messages yet
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Start the conversation by sending a message
                                    </Typography>
                                </Box>
                            ) : (
                                messages.map((msg) => (
                                    <MessageComponent
                                        key={msg.id}
                                        message={msg}
                                        isSender={msg.sender === sessionRepo.getDeviceId()}
                                        onCopy={copyToClipboard}
                                        onDownload={onDownloadFileClicked}
                                    />
                                ))
                            )}
                        </Box>

                        {/* Message Input - Sticky at Bottom */}
                        <Box
                            sx={{
                                p: 2,
                                borderTop: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            <MessageInput
                                messageInput={messageInput}
                                onMessageInputChange={setMessageInput}
                                onSendMessage={onSendMessagePressed}
                                onFileSelected={onFileSelected}
                                attachments={attachments}
                                onRemoveAttachment={(index) =>
                                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                                }
                            />
                        </Box>
                    </Paper>
                </Box>
            </Box>

            <FooterSection />

            {/* QR Code Modal */}
            <SessionLinkShareOverlay
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                link={sessionRepo.getSessionLink()}
            />
        </Box>
    );
};

export default SessionPage;
