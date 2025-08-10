"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Sparkles, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(99, 102, 241, 0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 sm:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Firebase & Next.js
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-gray-900 dark:text-white leading-tight">
                Create Amazing
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Events Together
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The modern platform for creating, discovering, and managing events with real-time collaboration and seamless user experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button size="lg" className="text-lg px-8 py-4 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/auth">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-6 text-gray-900 dark:text-white">
              Why Choose EventConnect?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technology to deliver the best event management experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Real-time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Experience instant updates with Firebase real-time listeners. See registrations, changes, and notifications as they happen.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Enterprise-grade security with Firebase Authentication. Support for email/password and Google sign-in.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Easy Management</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Intuitive dashboard to create, edit, and manage events with rich descriptions, images, and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Event Cards */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-6 text-gray-900 dark:text-white">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover amazing events happening in your community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Tech Innovation Summit 2024",
                description: "Join industry leaders for the latest in AI, blockchain, and emerging technologies.",
                date: "March 15, 2024",
                location: "San Francisco, CA",
                category: "Technology",
                attendees: 250,
                price: "Free",
                image: "🚀"
              },
              {
                title: "UX Design Masterclass",
                description: "Learn advanced design principles and hands-on techniques from industry experts.",
                date: "March 20, 2024",
                location: "New York, NY",
                category: "Design",
                attendees: 50,
                price: "$99",
                image: "🎨"
              },
              {
                title: "Startup Founders Meetup",
                description: "Connect with entrepreneurs, investors, and fellow startup enthusiasts.",
                date: "March 25, 2024",
                location: "Austin, TX",
                category: "Business",
                attendees: 120,
                price: "Free",
                image: "💼"
              }
            ].map((event, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative flex items-center justify-center">
                  <div className="text-6xl">{event.image}</div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 rounded-full text-white text-sm font-bold">
                      {event.price}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {event.attendees} attending
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold font-display">EventConnect</h3>
            </div>

            <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
              The modern platform for creating and managing events. Built with cutting-edge technology for the best user experience.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">Next.js 15</Badge>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">Firebase</Badge>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">Tailwind CSS</Badge>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">TypeScript</Badge>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 EventConnect. Built with ❤️ for the community.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
