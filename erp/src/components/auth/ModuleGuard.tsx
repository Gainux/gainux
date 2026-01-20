import { Navigate, Outlet } from 'react-router-dom';
import { useModules } from '@/context/ModuleContext';
import { type ModuleId } from '@/config/modules';

interface ModuleGuardProps {
    moduleId: ModuleId;
}

export default function ModuleGuard({ moduleId }: ModuleGuardProps) {
    const { isModuleEnabled } = useModules();

    if (!isModuleEnabled(moduleId)) {
        // Redirect to dashboard if module is disabled
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
