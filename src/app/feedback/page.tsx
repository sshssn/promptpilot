'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  ArrowLeft,
  Users
} from 'lucide-react';
import Link from 'next/link';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', description: 'Something is broken' },
  { value: 'feature', label: 'Feature Request', description: 'New functionality' },
  { value: 'improvement', label: 'Improvement', description: 'Enhance existing feature' },
  { value: 'question', label: 'Question', description: 'Need help' },
  { value: 'other', label: 'Other', description: 'Something else' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Nice to have' },
  { value: 'medium', label: 'Medium', description: 'Should be addressed' },
  { value: 'high', label: 'High', description: 'Important to fix' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issue' }
];

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: '',
    priority: 'medium',
    title: '',
    description: '',
    reporter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description: "Your feedback has been sent to the team via email. Thank you!",
        duration: 5000,
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      type: '',
      priority: 'medium',
      title: '',
      description: '',
      reporter: ''
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/landing">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Success State */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Feedback Submitted!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Thank you for your feedback. The team has been notified via email and will review your submission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                Submit Another
              </Button>
              <Link href="/playground">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Back to PromptPilot
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/landing">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Team Feedback
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            Internal Team Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Share Your Feedback
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Let's improve PromptPilot together by sharing your ideas, reporting issues, or requesting new features.
          </p>
        </div>

        {/* Form */}
        <Card className="w-full mx-auto shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              All feedback is sent directly to the development team via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Horizontal Form Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Feedback Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Feedback Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {FEEDBACK_TYPES.map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                          onClick={() => setFormData({ ...formData, type: type.value })}
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className={`w-3 h-3 rounded-full ${
                              formData.type === type.value ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`} />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {type.label}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Priority Level <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_LEVELS.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{priority.label}</span>
                              <span className="text-sm text-slate-500">- {priority.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reporter */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.reporter}
                      onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                      placeholder="Enter your name (minimum 4 characters)"
                      className="w-full"
                      minLength={4}
                      required
                    />
                    {formData.reporter.length > 0 && formData.reporter.length < 4 && (
                      <p className="text-sm text-red-500">Name must be at least 4 characters</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Brief Title (Optional)
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Summarize your feedback in one line"
                      className="w-full"
                      maxLength={100}
                    />
                    <div className="text-xs text-slate-500">
                      {formData.title.length}/100 characters
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Detailed Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide as much detail as possible. Include steps to reproduce if it's a bug, or specific requirements if it's a feature request. (Minimum 10 words)"
                      className="w-full min-h-[150px] resize-none"
                      maxLength={500}
                      required
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        {formData.description.split(' ').filter(word => word.length > 0).length}/10 words minimum
                      </span>
                      <span className={formData.description.length > 450 ? 'text-red-500' : 'text-slate-500'}>
                        {formData.description.length}/500 characters
                      </span>
                    </div>
                    {formData.description.split(' ').filter(word => word.length > 0).length > 0 && formData.description.split(' ').filter(word => word.length > 0).length < 10 && (
                      <p className="text-sm text-red-500">Description must be at least 10 words</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !formData.type || 
                    !formData.priority || 
                    !formData.description || 
                    !formData.reporter ||
                    formData.reporter.length < 4 ||
                    formData.description.split(' ').filter(word => word.length > 0).length < 10
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending to Team...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Team
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}