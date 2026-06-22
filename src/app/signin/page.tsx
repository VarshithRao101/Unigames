"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Shield, ArrowRight } from "lucide-react";

import { Loader } from "@/components/ui/loader";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading } = useAuth();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(callbackUrl);
    }
  }, [user, isLoading, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    // login function in auth-context calls signIn("google")
    await login("", "");
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-900 font-outfit">
        <Loader label="Signing in..." />
      </div>
    );
  }

  return (
    <div className="bg-transparent text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border-[3.5px] border-black p-8 rounded-[2rem] shadow-[6px_6px_0px_#000000] text-center space-y-6">
          <div className="w-14 h-14 bg-brand-orange/15 dark:bg-brand-orange/10 border-2.5 border-black rounded-2xl flex items-center justify-center mx-auto text-brand-orange shadow-[2px_2px_0px_#000000]">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] bg-brand-orange text-slate-950 border border-black px-2.5 py-1 rounded shadow-[1.5px_1.5px_0px_#000000] mb-2 inline-block">
              Secure Sign In
            </span>
            <h1 className="font-outfit font-black text-2xl uppercase tracking-tighter mt-3 text-slate-950 dark:text-white">
              Sign In to UniGame
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold leading-relaxed max-w-xs mx-auto">
              Sign in with your Google account to access game rooms, standings, and community chat.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              leftIcon={<GoogleIcon className="w-4.5 h-4.5 shrink-0" />}
              rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />}
              className="btn-neo w-full h-12 shadow-[3px_3px_0px_#000] flex justify-between items-center px-4"
            >
              Log In with Google
            </Button>
          </div>

          <p className="text-[8px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest">
            SECURE LOG IN
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="font-outfit text-sm font-black uppercase tracking-[0.2em] animate-pulse">Loading...</p>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
