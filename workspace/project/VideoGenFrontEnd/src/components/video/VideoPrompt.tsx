/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface VideoPromptProps {
  className?: string;
  prompt: string;
  isGenerating: boolean;
  canGenerate: boolean;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
}

export function VideoPrompt({
  className,
  prompt,
  isGenerating,
  canGenerate,
  onPromptChange,
  onSubmit,
}: VideoPromptProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Prompt input */}
      <div className="space-y-2">
        <Textarea
          id="prompt"
          placeholder="Enter video description"
          value={prompt}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          className="min-h-[100px] bg-muted resize-y"
        />
      </div>

      {/* Generate button */}
      <Button onClick={onSubmit} disabled={!canGenerate || isGenerating} className="w-full">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Video'
        )}
      </Button>
    </div>
  );
}
