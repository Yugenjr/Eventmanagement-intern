"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { CheckCircle, XCircle, Loader2, User, AlertTriangle } from "lucide-react";

export function AuthTest() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "connected" | "error">("loading");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [configDetails, setConfigDetails] = useState<any>({});

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log("Testing Firebase connection...");

        // Check if Firebase is properly initialized
        if (!auth) {
          throw new Error("Firebase auth is not initialized");
        }

        // Get the current config
        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        setConfigDetails(config);
        console.log("Firebase config:", config);

        // Test auth state ready
        await auth.authStateReady();
        console.log("Firebase Auth is ready!");

        setConnectionStatus("connected");
      } catch (error: any) {
        console.error("Firebase connection error:", error);
        setConnectionStatus("error");
        setErrorDetails(error.message || "Unknown error");
      }
    };

    testFirebaseConnection();
  }, []);

  if (connectionStatus === "loading") {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Testing Firebase Connection...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Checking Firebase configuration and connectivity...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (connectionStatus === "error") {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            Firebase Connection Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">Error Details:</p>
            <p className="text-sm text-red-700 dark:text-red-300 font-mono">{errorDetails}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-2">Configuration Check:</p>
            <div className="space-y-1 text-xs font-mono">
              <p>API Key: {configDetails.apiKey ? `${configDetails.apiKey.substring(0, 20)}...` : "❌ Missing"}</p>
              <p>Auth Domain: {configDetails.authDomain || "❌ Missing"}</p>
              <p>Project ID: {configDetails.projectId || "❌ Missing"}</p>
              <p>App ID: {configDetails.appId ? `${configDetails.appId.substring(0, 30)}...` : "❌ Missing"}</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Common Solutions:</p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                  <li>• Check if Firebase project exists and is active</li>
                  <li>• Verify API key is correct and not restricted</li>
                  <li>• Ensure Authentication is enabled in Firebase Console</li>
                  <li>• Check if domain is authorized in Firebase settings</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connection successful
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          Firebase Connected Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
            ✅ Firebase Authentication is ready!
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            You can now use the login forms below to test authentication.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium mb-2">Configuration Details:</p>
          <div className="space-y-1 text-xs font-mono">
            <p>✅ API Key: {configDetails.apiKey?.substring(0, 20)}...</p>
            <p>✅ Auth Domain: {configDetails.authDomain}</p>
            <p>✅ Project ID: {configDetails.projectId}</p>
            <p>✅ App ID: {configDetails.appId?.substring(0, 30)}...</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Next Steps:</p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                <li>• Use the login forms below to test authentication</li>
                <li>• Make sure Authentication is enabled in Firebase Console</li>
                <li>• Configure Google OAuth if you want to test Google sign-in</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
