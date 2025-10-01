'use client';

import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ModelToggle } from '@/components/model-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  SplitSquareHorizontal, 
  MessageSquare,
  ArrowRight,
  Wand2,
  BarChart3,
  Target,
  Code,
  Search,
  Users,
  FileText,
  Zap,
  Crown,
  Sparkles,
  Bot,
  Settings,
  TestTube,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo size={24} className="text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                PromptPilot
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ModelToggle showLabel={false} />
              <Link href="/playground">
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Playground
                </Button>
              </Link>
              <Link href="/playground/compare">
                <Button variant="ghost" size="sm">
                  <SplitSquareHorizontal className="h-4 w-4 mr-1" />
                  Compare
                </Button>
              </Link>
              <Link href="/feedback">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Internal AI Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            PromptPilot
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Create, test, and perfect AI prompts with their internal tool. Simple, fast, and built for the AI Product team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/playground">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Play className="mr-2 h-4 w-4" />
                Start
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground/compare">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <SplitSquareHorizontal className="mr-2 h-4 w-4" />
                Compare Models
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">AI Models</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TestTube className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">25+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Test Scenarios</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Pro</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Quality</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Fast</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Performance</div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Customer Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create specialized agents for classification, conversation flow, and complex troubleshooting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">How-To Guidance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Build step-by-step instruction agents for feature guidance and user onboarding.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Complex Queries</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Handle advanced troubleshooting and multi-step problem resolution with AI agents.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-lg">Conversation Flow</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage greetings, acknowledgments, and natural conversation flow in chatbots.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Prompt Generation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate, improve, and rewrite prompts with AI assistance and best practices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Live Testing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Test prompts with live AI responses, streaming output, and real-time feedback.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <SplitSquareHorizontal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg">Model Comparison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compare responses across GPT-5, DeepSeek, Gemini, and other AI models side-by-side.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-lg">Quality Evaluation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get detailed analysis and scoring (1-10 scale) with improvement recommendations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-lg">Stress Testing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Test with 25+ scenarios across sensitive data, escalation, and complex queries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle className="text-lg">Multimodal Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload and test with images, documents, and media files across AI models.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-lg">Advanced Config</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fine-tune temperature, tokens, top-p, top-k, and stop sequences for optimal results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <CardTitle className="text-lg">Chat History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Persistent conversation storage with session management and timestamps.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ready to Start Building?
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            The AI Product team can start creating better AI prompts in minutes. No setup, no learning curve, just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/playground">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Play className="mr-2 h-4 w-4" />
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground/compare">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <SplitSquareHorizontal className="mr-2 h-4 w-4" />
                Compare Models
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}