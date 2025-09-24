import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface StanceButtonProps {
  issueId: string;
  currentStance?: 'support' | 'oppose' | 'neutral';
  supportCount: number;
  opposeCount: number;
  neutralCount: number;
  onStanceChange: (issueId: string, stance: 'support' | 'oppose' | 'neutral') => void;
}

export function StanceButton({ 
  issueId, 
  currentStance, 
  supportCount, 
  opposeCount, 
  neutralCount,
  onStanceChange 
}: StanceButtonProps) {
  const [stance, setStance] = useState<'support' | 'oppose' | 'neutral' | undefined>(currentStance);

  const handleStanceClick = (newStance: 'support' | 'oppose' | 'neutral') => {
    const finalStance = stance === newStance ? undefined : newStance;
    setStance(finalStance);
    if (finalStance) {
      onStanceChange(issueId, finalStance);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={stance === 'support' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleStanceClick('support')}
        className={stance === 'support' 
          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
          : 'text-green-600 border-green-200 hover:bg-green-50'
        }
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        Support
        <Badge variant="secondary" className="ml-2">
          {supportCount}
        </Badge>
      </Button>
      
      <Button
        variant={stance === 'neutral' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleStanceClick('neutral')}
        className={stance === 'neutral' 
          ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600' 
          : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'
        }
      >
        <Minus className="h-4 w-4 mr-1" />
        Neutral
        <Badge variant="secondary" className="ml-2">
          {neutralCount}
        </Badge>
      </Button>
      
      <Button
        variant={stance === 'oppose' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleStanceClick('oppose')}
        className={stance === 'oppose' 
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
          : 'text-red-600 border-red-200 hover:bg-red-50'
        }
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        Oppose
        <Badge variant="secondary" className="ml-2">
          {opposeCount}
        </Badge>
      </Button>
    </div>
  );
}