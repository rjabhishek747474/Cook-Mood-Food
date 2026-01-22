'use client';
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-primary/20 to-background">
            {/* Full-width background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,214,0,0.1)_0%,transparent_50%)]" />

            <div className="relative w-full max-w-lg mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block -rotate-2 mb-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-primary px-6 py-3 border-3 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                            🍳 DailyCook
                        </h1>
                    </div>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
                        Sign in with Google to continue
                    </p>
                </div>

                {/* Auth Card */}
                <div className="border-3 border-foreground bg-card p-6 sm:p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none border-0 p-0 bg-transparent w-full",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "w-full border-3 border-foreground font-bold uppercase tracking-wide py-4 text-base hover:bg-primary hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all bg-background",
                                socialButtonsBlockButtonText: "font-bold text-foreground",
                                socialButtonsProviderIcon: "w-6 h-6",
                                dividerLine: "bg-foreground h-[2px]",
                                dividerText: "text-muted-foreground uppercase tracking-widest text-xs bg-card px-4",
                                formButtonPrimary: "bg-[#E85C3D] hover:bg-[#E85C3D]/90 border-3 border-foreground font-bold uppercase tracking-wide py-4 text-base shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]",
                                formFieldInput: "border-3 border-foreground focus:shadow-[4px_4px_0_0_hsl(var(--primary))] py-3",
                                formFieldLabel: "font-bold uppercase tracking-wide text-xs",
                                footerAction: "hidden",
                                footer: "hidden",
                                identityPreview: "border-3 border-foreground bg-section-blue",
                                identityPreviewText: "font-bold",
                                identityPreviewEditButton: "text-primary font-bold uppercase",
                            }
                        }}
                        routing="path"
                        path="/login"
                        signUpUrl="/signup"
                    />
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="font-bold text-foreground hover:text-primary underline underline-offset-4 transition-colors">
                        Sign up
                    </a>
                </p>

                {/* Decorative elements */}
                <div className="hidden sm:block absolute -bottom-4 -left-4 w-16 h-16 bg-primary border-3 border-foreground -rotate-12 -z-10" />
                <div className="hidden sm:block absolute -top-4 -right-4 w-12 h-12 bg-[#E85C3D] border-3 border-foreground rotate-12 -z-10" />
            </div>
        </div>
    );
}
