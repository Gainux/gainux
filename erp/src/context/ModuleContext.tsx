import React, { createContext, useContext, useState, useEffect } from 'react';
import { MODULES, type ModuleId } from '../config/modules';
import { useAuth } from './AuthContext';
import { departmentAccessService } from '@/services/departmentAccessService';

interface ModuleContextType {
    enabledModules: ModuleId[];
    isModuleEnabled: (id: ModuleId) => boolean;
    toggleModule: (id: ModuleId) => void;
    enableModule: (id: ModuleId) => void;
    disableModule: (id: ModuleId) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    const { user, profile, loading: authLoading } = useAuth();
    // systemModules: Globally enabled modules (e.g. by License or Admin setting)
    const [systemModules, setSystemModules] = useState<ModuleId[]>(() => {
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

    // allowedModules: Modules user is specifically allowed to see (Intersection of System & Department)
    const [allowedModules, setAllowedModules] = useState<ModuleId[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    // Persist system modules
    useEffect(() => {
        localStorage.setItem('enabledModules', JSON.stringify(systemModules));
    }, [systemModules]);

    // Calculate allowed modules based on Role & Department
    useEffect(() => {
        const fetchPermissions = async () => {
            // If auth is still loading, wait
            if (authLoading) return;

            // By default, if no user, maybe show nothing or public?
            // Assuming protected routes handle "no user", here we assume "no permission" if no user.
            if (!user || !profile) {
                setAllowedModules([]); // Or default public modules
                setLoadingPermissions(false);
                return;
            }

            // Admin/Owner: Access to ALL System Enabled Modules (or ALL modules?)
            // Usually Admin decides what is enabled for the company (SystemModules).
            // So Admin has access to whatever is enabled in SystemModules.
            if (profile.role === 'admin' || profile.role === 'manager' || profile.is_super_admin) {
                // Admins see all enabled system modules
                setAllowedModules(systemModules);
                setLoadingPermissions(false);
                return;
            }

            // Employee: Check Department Access
            if (profile.role === 'employee') {
                try {
                    const deptAllowed = await departmentAccessService.getEmployeeModuleAccessByUserId(user.id);
                    // Intersection: Employee can only see modules that are BOTH:
                    // 1. Enabled for the Company (systemModules)
                    // 2. Allowed for their Department (deptAllowed)
                    const intersect = systemModules.filter(m => deptAllowed.includes(m));
                    setAllowedModules(intersect);
                } catch (error) {
                    console.error("Failed to fetch department permissions", error);
                    // Fallback: If error, maybe safe to show nothing or just systemModules?
                    // Safe approach: Show nothing to prevent unauthorized access
                    setAllowedModules([]);
                }
                setLoadingPermissions(false);
            } else {
                // Other roles (guest?): No access
                setAllowedModules([]);
                setLoadingPermissions(false);
            }
        };

        fetchPermissions();
    }, [user, profile, authLoading, systemModules]); // Re-run if system settings change or user changes

    const isModuleEnabled = (id: ModuleId) => {
        // If still loading, maybe return false or true? False is safer.
        if (loadingPermissions) return false;

        // Check allowed list
        return allowedModules.includes(id);
    };

    const toggleModule = (id: ModuleId) => {
        // Only Admin should toggle system modules really, but keeping logic for now
        // This toggles GLOBAL system availability (persisted to localStorage)
        const module = MODULES.find(m => m.id === id);
        if (module?.required) return;

        setSystemModules(prev => {
            if (prev.includes(id)) {
                return prev.filter(m => m !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const enableModule = (id: ModuleId) => {
        setSystemModules(prev => {
            if (!prev.includes(id)) return [...prev, id];
            return prev;
        });
    };

    const disableModule = (id: ModuleId) => {
        const module = MODULES.find(m => m.id === id);
        if (module?.required) return;
        setSystemModules(prev => prev.filter(m => m !== id));
    };

    return (
        <ModuleContext.Provider value={{ enabledModules: allowedModules, isModuleEnabled, toggleModule, enableModule, disableModule }}>
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
