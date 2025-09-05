// /src/app/dashboard/settings/page.tsx
import { Cog } from "lucide-react";

export default function SettingsPage() {
    return (
        <main className="flex min-h-[60vh] items-center justify-center p-6 md:p-12">
            <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-muted/10 border border-border">
                    <Cog className="h-7 w-7 md:h-8 md:w-8 text-primary animate-spin-slow" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Under Development</p>
                </div>
            </div>
        </main>
    );
}