import { CheckCircle2, Mail } from "lucide-react";
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

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent you a verification link. Please check your email and
              click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Verification email sent successfully</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try signing up
              again.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/sign-in">Back to Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Try Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
