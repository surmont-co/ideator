import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function SplashPage() {
    const user = await getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-blue-900/20 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="white"
                            className="w-7 h-7"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Ideator
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
                        Platforma de prioritizare democratică a propunerilor.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <p className="text-sm text-center text-slate-600 dark:text-slate-400 leading-relaxed">
                        Autentifică-te pentru a accesa dashboard-ul, a naviga prin propuneri
                        și a vota ideile preferate.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-2">
                    <Button asChild className="w-full h-11 text-base shadow-md" size="lg">
                        <Link href="/api/auth/login">
                            Autentificare cu WorkOS
                        </Link>
                    </Button>
                    <p className="text-xs text-center text-slate-400 dark:text-slate-600">
                        Acces securizat pentru membrii organizației.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
