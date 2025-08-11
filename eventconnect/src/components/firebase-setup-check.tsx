"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { auth, db, rtdb, storage } from "@/lib/firebase";

interface ServiceStatus {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  required: boolean;
}

export function FirebaseSetupCheck() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      const results: ServiceStatus[] = [];

      // Check Authentication
      results.push({
        name: "Authentication",
        status: auth ? 'success' : 'error',
        message: auth ? 'Authentication is configured' : 'Authentication not available',
        required: true
      });

      // Check Firestore
      if (db) {
        try {
          // Try a simple operation to test Firestore
          results.push({
            name: "Firestore Database",
            status: 'success',
            message: 'Firestore is configured and accessible',
            required: true
          });
        } catch (error) {
          results.push({
            name: "Firestore Database",
            status: 'error',
            message: 'Firestore is configured but not accessible. Check your rules.',
            required: true
          });
        }
      } else {
        results.push({
          name: "Firestore Database",
          status: 'error',
          message: 'Firestore Database not configured. Please enable it in Firebase Console.',
          required: true
        });
      }

      // Check Realtime Database
      results.push({
        name: "Realtime Database",
        status: rtdb ? 'success' : 'warning',
        message: rtdb ? 'Realtime Database is configured' : 'Realtime Database not available (optional)',
        required: false
      });

      // Check Storage
      results.push({
        name: "Storage",
        status: storage ? 'success' : 'warning',
        message: storage ? 'Storage is configured' : 'Storage not available (optional for image uploads)',
        required: false
      });

      setServices(results);
      
      // Show the check if there are any errors or warnings
      const hasIssues = results.some(s => s.status === 'error' || (s.status === 'warning' && s.required));
      setIsVisible(hasIssues);
    };

    checkServices();
  }, []);

  if (!isVisible || services.length === 0) {
    return null;
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription>
        <div className="flex items-center justify-between mb-3">
          <strong className="text-orange-800 dark:text-orange-200">Firebase Setup Status</strong>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 dark:text-orange-400"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-2 mb-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {getIcon(service.status)}
              <span className="font-medium">{service.name}:</span>
              <span className={service.status === 'error' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}>
                {service.message}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <a 
            href="https://console.firebase.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            Firebase Console <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-orange-400">•</span>
          <a 
            href="/FIREBASE_SETUP.md" 
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            Setup Guide <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}
