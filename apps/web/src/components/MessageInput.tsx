import React, { ChangeEvent, FC, useRef } from "react";
import {
    TextField,
    IconButton,
    Tooltip,
    InputAdornment,
    Box,
    Stack,
    Chip,
    Paper,
} from "@mui/material";
import { AttachFile, ContentPaste, Send as SendIcon, Close } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface MessageInputProps {
    messageInput: string;
    onMessageInputChange: (newInput: string) => void;
    onSendMessage: () => void;
    onFileSelected: (event: ChangeEvent<HTMLInputElement>) => void;
    attachments: File[];
    onRemoveAttachment: (index: number) => void;
}

const MessageInput: FC<MessageInputProps> = ({
    messageInput,
    onMessageInputChange,
    onSendMessage,
    onFileSelected,
    attachments,
    onRemoveAttachment,
}) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onAttachFileClicked = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            onMessageInputChange(messageInput + clipboardText);
        } catch (error) {
            console.error("Failed to read clipboard contents: ", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    const canSend = messageInput.trim().length > 0 || attachments.length > 0;

    return (
        <Box>
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}
                >
                    {attachments.map((file, index) => (
                        <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => onRemoveAttachment(index)}
                            deleteIcon={<Close />}
                            color="primary"
                            variant="outlined"
                            sx={{
                                maxWidth: 200,
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }
                            }}
                        />
                    ))}
                </Stack>
            )}

            {/* Input Field */}
            <Paper
                elevation={0}
                sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 1,
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    '&:focus-within': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                    },
                }}
            >
                <TextField
                    variant="standard"
                    value={messageInput}
                    onChange={(e) => onMessageInputChange(e.target.value)}
                    placeholder="Type a message..."
                    multiline
                    maxRows={4}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                                <Tooltip title="Paste from Clipboard">
                                    <IconButton 
                                        size="small"
                                        onClick={handlePasteFromClipboard}
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        <ContentPaste fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Attach File">
                                    <IconButton 
                                        size="small"
                                        onClick={onAttachFileClicked}
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        <AttachFile fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: '0.95rem',
                        },
                    }}
                />
                <Tooltip title="Send Message">
                    <span>
                        <IconButton
                            onClick={onSendMessage}
                            disabled={!canSend}
                            sx={{
                                bgcolor: canSend ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                                color: canSend ? theme.palette.primary.contrastText : theme.palette.action.disabled,
                                '&:hover': {
                                    bgcolor: canSend ? theme.palette.primary.dark : theme.palette.action.disabledBackground,
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={onFileSelected}
                />
            </Paper>
        </Box>
    );
};

export default MessageInput;
