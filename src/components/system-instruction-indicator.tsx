'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  FileText,
  User,
  Settings,
  Crown,
  Sparkles
} from 'lucide-react';

interface SystemInstructionIndicatorProps {
  userSystemInstruction?: string;
  userPrompt?: string;
  context?: string;
  className?: string;
  onSaveSettings?: (newSystemPrompt: string) => void;
}

// Client-side logic to determine instruction type
function analyzeSystemInstruction(instruction: string): {
  isPlaceholder: boolean;
  isMeaningful: boolean;
  shouldUseLangMd: boolean;
} {
  if (!instruction || instruction.trim().length === 0) {
    return { isPlaceholder: true, isMeaningful: false, shouldUseLangMd: true };
  }

  const trimmed = instruction.trim();
  
  // Check for default/placeholder patterns that should use Golden Standard
  const defaultPatterns = [
    /^you are a helpful assistant$/i,
    /^you are a helpful ai$/i,
    /^enter detailed instructions/i,
    /^for example/i,
    /^placeholder/i,
    /^enter your/i,
    /^type your/i,
    /^add your/i,
    /^you are an ai assistant$/i,
    /^you are chatgpt$/i,
    /^you are claude$/i,
    /^you are gemini$/i,
    /^you are a language model$/i,
    /^you are an ai$/i,
    /^assistant$/i,
    /^ai assistant$/i,
    /^helpful assistant$/i,
    /^ai$/i,
    /^bot$/i,
    /^chatbot$/i
  ];

  const isDefault = defaultPatterns.some(pattern => pattern.test(trimmed));
  const isShort = trimmed.length < 50; // Increased threshold to be more conservative
  const isMeaningful = !isDefault && !isShort && trimmed.length > 0;
  const shouldUseLangMd = isDefault || isShort;

  return { isPlaceholder: isDefault, isMeaningful, shouldUseLangMd };
}

export function SystemInstructionIndicator({ 
  userSystemInstruction, 
  userPrompt = '', 
  context = 'playground',
  className = '',
  onSaveSettings
}: SystemInstructionIndicatorProps) {
  const [instructionInfo, setInstructionInfo] = useState<{
    shouldUseLangMd: boolean;
    reasoning: string;
    appliedSource: 'user_instruction' | 'lang_md_default';
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const analyzeInstruction = () => {
      const analysis = analyzeSystemInstruction(userSystemInstruction || '');
      
      const reasoning = analysis.shouldUseLangMd 
        ? "Using Golden Standard (proven templates)."
        : "Using custom instruction provided by user.";
      
      setInstructionInfo({
        shouldUseLangMd: analysis.shouldUseLangMd,
        reasoning,
        appliedSource: analysis.shouldUseLangMd ? 'lang_md_default' : 'user_instruction'
      });
    };

    analyzeInstruction();
  }, [userSystemInstruction, userPrompt, context]);

  const handleEdit = () => {
    setEditValue(userSystemInstruction || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSaveSettings) {
      onSaveSettings(editValue);
    }
    setIsEditing(false); // Auto-close the component
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleUseGoldenStandard = () => {
    if (onSaveSettings) {
      onSaveSettings(''); // Empty string will trigger Golden Standard
    }
    setIsEditing(false); // Auto-close the component
  };

  if (!instructionInfo) {
    return null;
  }

  const isUsingUserInstruction = instructionInfo.appliedSource === 'user_instruction';
  const isUsingGoldenStandard = instructionInfo.appliedSource === 'lang_md_default';

  if (isEditing) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Edit System Instruction
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-8 px-3 text-xs"
                >
                  Save
                </Button>
              </div>
            </div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter your custom system instruction..."
              className="w-full h-32 p-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseGoldenStandard}
                className="h-8 px-3 text-xs"
              >
                <Crown className="h-3 w-3 mr-1" />
                Use Golden Standard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} min-h-[32px]`}>
      {/* Status Indicator - Just the badge, no buttons */}
      <div className="flex items-center justify-center">
        <Badge 
          variant={isUsingUserInstruction ? "default" : "secondary"}
          className={`gap-1.5 text-xs px-3 py-1.5 ${
            isUsingUserInstruction 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700'
          }`}
        >
          {isUsingUserInstruction ? (
            <>
              <Sparkles className="h-3 w-3" />
              Custom Instructions
            </>
          ) : (
            <>
              <Crown className="h-3 w-3" />
              Golden Standard
            </>
          )}
        </Badge>
      </div>

      {/* Minimal Details Panel */}
      {showDetails && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p><strong>Status:</strong> {isUsingUserInstruction ? 'Custom instruction active' : 'Using Golden Standard'}</p>
            <p><strong>Reasoning:</strong> {instructionInfo.reasoning}</p>
            {isUsingLangMd && (
              <p className="text-amber-600 dark:text-amber-400">
                💡 <strong>Tip:</strong> Click "Edit" to add custom instruction or switch back to Golden Standard.
              </p>
            )}
            {isUsingUserInstruction && (
              <p className="text-blue-600 dark:text-blue-400">
                💡 <strong>Tip:</strong> Click "Edit" to modify your custom instruction or switch back to Golden Standard.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
