import React, { createContext, useContext, useState, useEffect } from 'react';
import { MODULES, type ModuleId } from '../config/modules';

interface ModuleContextType {
    enabledModules: ModuleId[];
    isModuleEnabled: (id: ModuleId) => boolean;
    toggleModule: (id: ModuleId) => void;
    enableModule: (id: ModuleId) => void;
    disableModule: (id: ModuleId) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    const [enabledModules, setEnabledModules] = useState<ModuleId[]>(() => {
        const stored = localStorage.getItem('enabledModules');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse enabled modules", e);
            }
        }
        return MODULES.filter(m => m.defaultEnabled).map(m => m.id);
    });

    useEffect(() => {
        localStorage.setItem('enabledModules', JSON.stringify(enabledModules));
    }, [enabledModules]);

    const isModuleEnabled = (id: ModuleId) => {
        return enabledModules.includes(id);
    };

    const toggleModule = (id: ModuleId) => {
        const module = MODULES.find(m => m.id === id);
        if (module?.required) return; // Cannot toggle required modules

        setEnabledModules(prev => {
            if (prev.includes(id)) {
                return prev.filter(m => m !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const enableModule = (id: ModuleId) => {
        setEnabledModules(prev => {
            if (!prev.includes(id)) return [...prev, id];
            return prev;
        });
    };

    const disableModule = (id: ModuleId) => {
        const module = MODULES.find(m => m.id === id);
        if (module?.required) return;

        setEnabledModules(prev => prev.filter(m => m !== id));
    };

    return (
        <ModuleContext.Provider value={{ enabledModules, isModuleEnabled, toggleModule, enableModule, disableModule }}>
            {children}
        </ModuleContext.Provider>
    );
}

export function useModules() {
    const context = useContext(ModuleContext);
    if (context === undefined) {
        throw new Error('useModules must be used within a ModuleProvider');
    }
    return context;
}
