import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Clock, MapPin, Flame } from 'lucide-react';
import { StanceButton } from './StanceButton';
import { CommentSection } from './CommentSection';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  timestamp: string;
  trending: boolean;
  supportCount: number;
  opposeCount: number;
  neutralCount: number;
  comments: Array<{
    id: string;
    user: string;
    content: string;
    timestamp: string;
    likes: number;
    stance?: 'support' | 'oppose' | 'neutral';
  }>;
  userStance?: 'support' | 'oppose' | 'neutral';
}

interface IssueCardProps {
  issue: Issue;
  onStanceChange: (issueId: string, stance: 'support' | 'oppose' | 'neutral') => void;
  onAddComment: (issueId: string, content: string) => void;
}

export function IssueCard({ issue, onStanceChange, onAddComment }: IssueCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Healthcare': 'bg-blue-100 text-blue-700 border-blue-200',
      'Environment': 'bg-green-100 text-green-700 border-green-200',
      'Economy': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Education': 'bg-purple-100 text-purple-700 border-purple-200',
      'Immigration': 'bg-orange-100 text-orange-700 border-orange-200',
      'Technology': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getCategoryColor(issue.category)}>
                {issue.category}
              </Badge>
              {issue.trending && (
                <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">
                  <Flame className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            <h3 className="leading-tight">{issue.title}</h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{issue.timestamp}</span>
          </div>
          {issue.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{issue.location}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
        
        <div className="border-t pt-4 space-y-4">
          <StanceButton
            issueId={issue.id}
            currentStance={issue.userStance}
            supportCount={issue.supportCount}
            opposeCount={issue.opposeCount}
            neutralCount={issue.neutralCount}
            onStanceChange={onStanceChange}
          />
          
          <CommentSection
            issueId={issue.id}
            comments={issue.comments}
            onAddComment={onAddComment}
          />
        </div>
      </CardContent>
    </Card>
  );
}