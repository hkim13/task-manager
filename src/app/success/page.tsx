import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";

("use client");

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../../supabase/client";

export default function SuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const checkSubscription = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsProcessing(false);
        return;
      }

      // Poll for subscription status for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;

      const pollSubscription = async () => {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (subscription) {
          setSubscriptionActive(true);
          setIsProcessing(false);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(pollSubscription, 2000);
        } else {
          setIsProcessing(false);
        }
      };

      pollSubscription();
    };

    checkSubscription();
  }, [sessionId]);

  if (isProcessing) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Processing Payment...
              </CardTitle>
              <CardDescription>
                Please wait while we activate your subscription.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {subscriptionActive ? "Payment Successful!" : "Payment Received!"}
            </CardTitle>
            <CardDescription>
              {subscriptionActive
                ? "Your subscription is now active. Redirecting to dashboard..."
                : "Thank you for your purchase. Your payment has been processed successfully."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              {subscriptionActive
                ? "You will be redirected to your dashboard shortly."
                : "You will receive a confirmation email shortly with your purchase details."}
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
