import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import ManageTraining from "./ManageTraining";
import MyLearning from "./MyLearning";

export default function TrainingDashboard() {
    const { profile } = useAuth();
    const isManager = profile?.role === 'admin' || profile?.role === 'manager';

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Training & Development</h2>
                    <p className="text-muted-foreground">
                        Access learning resources and track your professional growth.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="my-learning" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-learning">My Learning</TabsTrigger>
                    {isManager && (
                        <TabsTrigger value="manage">Manage Training</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="my-learning" className="space-y-4">
                    <MyLearning />
                </TabsContent>

                {isManager && (
                    <TabsContent value="manage" className="space-y-4">
                        <ManageTraining />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
