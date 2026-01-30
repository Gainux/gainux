import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { settingsService } from "@/services/settingsService";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    primaryColor: string;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [primaryColor, setPrimaryColorState] = useState<string>("blue");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const settings = await settingsService.getSettings();
            const savedTheme = settings.darkMode ? "dark" : "light";
            const savedPrimaryColor = settings.primaryColor || "blue";

            setThemeState(savedTheme);
            setPrimaryColorState(savedPrimaryColor);

            applyTheme(savedTheme);
            applyPrimaryColor(savedPrimaryColor);
        } catch (err) {
            console.error("Error loading theme:", err);
        }
    };

    const applyTheme = (newTheme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
    };

    const applyPrimaryColor = (color: string) => {
        const root = window.document.documentElement;
        if (color.startsWith('#')) {
            root.style.setProperty("--primary", color);
        } else {
            // Map the color name to the CSS variable
            // The CSS variables are named --primary-blue, --primary-green, etc.
            root.style.setProperty("--primary", `var(--primary-${color})`);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        try {
            await settingsService.updateSettings({ darkMode: newTheme === "dark" });
        } catch (err) {
            console.error("Error saving theme:", err);
        }
    };

    const setPrimaryColor = async (color: string) => {
        setPrimaryColorState(color);
        applyPrimaryColor(color);
        try {
            await settingsService.updateSettings({ primaryColor: color });
        } catch (err) {
            console.error("Error saving primary color:", err);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, primaryColor, toggleTheme, setTheme, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
