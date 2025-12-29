import React from "react";
import { Box, IconButton, Paper, Typography, Tooltip, Avatar } from "@mui/material";
import { ContentCopy, FileDownload, Refresh } from "@mui/icons-material";
import { FileMessage, Message, MessageStatusType, MessageType, TextMessage } from "../models/Message";
import { MessageBubble } from "./MessageBubble";
import { useTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";

interface MessageComponentProps {
    message: Message;
    isSender: boolean;
    onCopy?: (text?: string) => void;
    onDownload?: (msg: FileMessage) => void;
}

const MessageComponent: React.FC<MessageComponentProps> = ({
    message,
    isSender,
    onCopy,
    onDownload,
}) => {
    const theme = useTheme();

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const header = (
        <Box
            sx={{
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
                mt: 0.5,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}
        >
            {!isSender && (
                <>
                    <Typography variant="caption" fontWeight={500}>
                        {message.senderName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        •
                    </Typography>
                </>
            )}
            <Typography variant="caption" color="text.secondary">
                {formatTime(message.sentAt.toDate())}
            </Typography>
        </Box>
    );

    const renderCopyButton = (textMsg: TextMessage) => (
        <Tooltip title="Copy message">
            <IconButton
                size="small"
                onClick={() => onCopy?.(textMsg.text)}
                sx={{
                    opacity: 0.7,
                    '&:hover': {
                        opacity: 1,
                        backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease',
                }}
            >
                <ContentCopy fontSize="small" />
            </IconButton>
        </Tooltip>
    );

    const renderDownloadButton = (fileMsg: FileMessage) => {
        const isLoading = fileMsg.status.type === MessageStatusType.LOADING;
        const isError = fileMsg.status.type === MessageStatusType.ERROR;

        return (
            <Tooltip title={isError ? "Retry download" : "Download file"}>
                <IconButton
                    size="small"
                    disabled={isLoading && !isError}
                    onClick={() => onDownload?.(fileMsg)}
                    sx={{
                        opacity: 0.7,
                        '&:hover': {
                            opacity: 1,
                            backgroundColor: theme.palette.action.hover,
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isError ? <Refresh fontSize="small" /> : <FileDownload fontSize="small" />}
                </IconButton>
            </Tooltip>
        );
    };

    const renderProgressIndicator = (progressValue: number) => (
        <Box sx={{ position: "relative", display: "inline-flex", mr: 1 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: `3px solid ${theme.palette.primary.main}30`,
                    borderTopColor: theme.palette.primary.main,
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                    },
                }}
            />
            {progressValue >= 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {Math.round(progressValue)}%
                    </Typography>
                </Box>
            )}
        </Box>
    );

    let content;
    if (message.type === MessageType.TEXT) {
        const textMsg = message as TextMessage;
        content = (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {!isSender && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            mt: 0.5,
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                )}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        {isSender && renderCopyButton(textMsg)}
                        <MessageBubble
                            isSender={isSender}
                            sx={{
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                textAlign: "left",
                                maxWidth: "100%",
                                px: 2,
                                py: 1.25,
                                borderRadius: isSender 
                                    ? '18px 18px 4px 18px' 
                                    : '18px 18px 18px 4px',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 2px 8px rgba(0,0,0,0.3)' 
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                        >
                            {textMsg.text ??
                                (textMsg.status.type === MessageStatusType.LOADING
                                    ? (textMsg.status.progress > -1
                                        ? `${textMsg.status.progress}% loaded`
                                        : "Loading...")
                                    : "Error loading message")}
                        </MessageBubble>
                        {!isSender && renderCopyButton(textMsg)}
                    </Box>
                    {header}
                </Box>
                {isSender && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            mt: 0.5,
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                )}
            </Box>
        );
    } else if (message.type === MessageType.FILE) {
        const fileMsg = message as FileMessage;
        const isLoading = fileMsg.status.type === MessageStatusType.LOADING;
        const progressValue = fileMsg.status.type === MessageStatusType.LOADING ? fileMsg.status.progress : -1;

        const formatFileSize = (bytes: number) => {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        };

        content = (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {!isSender && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            mt: 0.5,
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                )}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {isLoading && renderProgressIndicator(progressValue)}
                        {!isLoading && isSender && renderDownloadButton(fileMsg)}
                        <MessageBubble
                            isSender={isSender}
                            sx={{
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                textAlign: "left",
                                maxWidth: "100%",
                                px: 2,
                                py: 1.25,
                                borderRadius: isSender 
                                    ? '18px 18px 4px 18px' 
                                    : '18px 18px 18px 4px',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 2px 8px rgba(0,0,0,0.3)' 
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FileDownload fontSize="small" />
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {fileMsg.filename}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(fileMsg.fileSize || 0)}
                                    </Typography>
                                </Box>
                            </Box>
                        </MessageBubble>
                        {!isLoading && !isSender && renderDownloadButton(fileMsg)}
                        {isLoading && !isSender && renderProgressIndicator(progressValue)}
                    </Box>
                    {header}
                </Box>
                {isSender && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            mt: 0.5,
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                )}
            </Box>
        );
    } else {
        content = <Box>Unsupported message type</Box>;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSender ? "flex-end" : "flex-start",
                mb: 2,
                px: 1,
            }}
        >
            {content}
        </Box>
    );
};

export default MessageComponent;
