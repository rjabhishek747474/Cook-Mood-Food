'use client';
import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#E85C3D]/10 to-background">
            {/* Full-width background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,92,61,0.1)_0%,transparent_50%)]" />

            <div className="relative w-full max-w-lg mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block rotate-2 mb-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-[#E85C3D] text-white px-6 py-3 border-3 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                            🍳 DailyCook
                        </h1>
                    </div>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
                        Create your free account
                    </p>
                </div>

                {/* Auth Card */}
                <div className="border-3 border-foreground bg-card p-6 sm:p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                    <SignUp
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
                                formButtonPrimary: "bg-primary hover:bg-primary/90 border-3 border-foreground font-bold uppercase tracking-wide py-4 text-base text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]",
                                formFieldInput: "border-3 border-foreground focus:shadow-[4px_4px_0_0_hsl(var(--primary))] py-3",
                                formFieldLabel: "font-bold uppercase tracking-wide text-xs",
                                footerAction: "hidden",
                                footer: "hidden",
                                identityPreview: "border-3 border-foreground bg-section-green",
                                identityPreviewText: "font-bold",
                                identityPreviewEditButton: "text-primary font-bold uppercase",
                            }
                        }}
                        routing="path"
                        path="/signup"
                        signInUrl="/login"
                    />
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{' '}
                    <a href="/login" className="font-bold text-foreground hover:text-[#E85C3D] underline underline-offset-4 transition-colors">
                        Sign in
                    </a>
                </p>

                {/* Decorative elements */}
                <div className="hidden sm:block absolute -bottom-4 -right-4 w-16 h-16 bg-[#E85C3D] border-3 border-foreground rotate-12 -z-10" />
                <div className="hidden sm:block absolute -top-4 -left-4 w-12 h-12 bg-primary border-3 border-foreground -rotate-12 -z-10" />
            </div>
        </div>
    );
}
