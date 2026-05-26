import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white">404</h1>
        <p className="mt-2 text-sm text-white/60">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#F97316] px-4 text-sm font-medium text-black hover:bg-[#fb8a3d]">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-white">This page didn't load</h1>
        <p className="mt-2 text-sm text-white/60">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#F97316] px-4 text-sm font-medium text-black hover:bg-[#fb8a3d]"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SignBridge AI — Real-time Sign Language Translation" },
      { name: "description", content: "Premium real-time AI sign-to-speech translation platform." },
      { name: "theme-color", content: "#0A0A0F" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body className="bg-[#0A0A0F] text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
