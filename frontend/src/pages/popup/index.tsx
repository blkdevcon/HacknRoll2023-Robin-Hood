import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/popup/index.css";
import "@assets/styles/tailwind.css";
import Popup from "@pages/popup/Popup";
import { createTheme, ThemeProvider } from "@mui/material";

function init() {
    const theme = createTheme({
        palette: {
            primary: {
                main: "#293056"
            }
        }
    });
    const rootContainer = document.querySelector("#__root");
    if (!rootContainer) throw new Error("Can't find Popup root element");
    const root = createRoot(rootContainer);
    root.render(
        <ThemeProvider theme={theme}>
            <Popup />
        </ThemeProvider>
    );
}

init();
