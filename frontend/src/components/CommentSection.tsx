import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { Card } from './ui/card';

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  likes: number;
  stance?: 'support' | 'oppose' | 'neutral';
}

interface CommentSectionProps {
  issueId: string;
  comments: Comment[];
  onAddComment: (issueId: string, content: string) => void;
}

export function CommentSection({ issueId, comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(issueId, newComment);
      setNewComment('');
    }
  };

  const getStanceBadgeColor = (stance?: string) => {
    switch (stance) {
      case 'support': return 'bg-green-100 text-green-700 border-green-200';
      case 'oppose': return 'bg-red-100 text-red-700 border-red-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {comments.length} Comments
        </Button>
      </div>

      {showComments && (
        <div className="space-y-4 pl-4 border-l-2 border-purple-200">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Share your thoughts on this issue..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Comment
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-3">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {comment.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{comment.user}</span>
                      {comment.stance && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStanceBadgeColor(comment.stance)}`}
                        >
                          {comment.stance}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}