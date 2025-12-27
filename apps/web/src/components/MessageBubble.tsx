import { styled } from "@mui/material/styles";
import {Card} from "@mui/material";

interface MessageBubbleProps {
    isSender: boolean;
}

export const MessageBubble = styled(Card, {
    shouldForwardProp: (prop) => prop !== "isSender",
})<MessageBubbleProps>(({ theme, isSender }) => {
    return {
        listStyle: "none",
        padding: theme.spacing(1.5, 2),
        marginBottom: theme.spacing(0.5),
        borderRadius: isSender ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isSender 
            ? theme.palette.primary.main 
            : (theme.palette.mode === 'dark' 
                ? theme.palette.grey[800] 
                : theme.palette.grey[100]),
        color: isSender 
            ? theme.palette.primary.contrastText 
            : theme.palette.text.primary,
        boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
    };
});
