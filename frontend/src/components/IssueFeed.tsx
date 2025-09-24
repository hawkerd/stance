import { useState } from 'react';
import { IssueCard, Issue } from './IssueCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Clock, Flame } from 'lucide-react';

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Universal Healthcare Reform Act 2024',
    description: 'A comprehensive bill proposing government-funded healthcare for all citizens, including coverage for prescription drugs, mental health services, and preventive care. The bill aims to reduce healthcare costs while ensuring universal access.',
    category: 'Healthcare',
    location: 'National',
    timestamp: '2 hours ago',
    trending: true,
    supportCount: 1247,
    opposeCount: 892,
    neutralCount: 156,
    comments: [
      {
        id: '1',
        user: 'Sarah Mitchell',
        content: 'This is exactly what we need. Healthcare should be a right, not a privilege. Other countries have proven this system works.',
        timestamp: '1 hour ago',
        likes: 23,
        stance: 'support'
      },
      {
        id: '2',
        user: 'Mike Thompson',
        content: 'While I support universal coverage in principle, we need to address how this will be funded without crushing small businesses.',
        timestamp: '45 minutes ago',
        likes: 18,
        stance: 'neutral'
      }
    ]
  },
  {
    id: '2',
    title: 'Green Energy Infrastructure Investment',
    description: 'Proposed $500 billion investment in renewable energy infrastructure, including solar farms, wind turbines, and electric vehicle charging networks across all 50 states.',
    category: 'Environment',
    location: 'National',
    timestamp: '4 hours ago',
    trending: true,
    supportCount: 2103,
    opposeCount: 543,
    neutralCount: 287,
    comments: [
      {
        id: '3',
        user: 'David Chen',
        content: 'This investment will create millions of jobs while combating climate change. It\'s a win-win for both the economy and environment.',
        timestamp: '3 hours ago',
        likes: 45,
        stance: 'support'
      }
    ]
  },
  {
    id: '3',
    title: 'Student Loan Forgiveness Program',
    description: 'Proposal to forgive up to $50,000 in federal student loan debt for borrowers earning less than $125,000 annually, with additional provisions for public service workers.',
    category: 'Education',
    location: 'National',
    timestamp: '6 hours ago',
    trending: false,
    supportCount: 1876,
    opposeCount: 1234,
    neutralCount: 432,
    comments: [
      {
        id: '4',
        user: 'Emily Rodriguez',
        content: 'This would be life-changing for so many people drowning in debt. Education should lift people up, not burden them for decades.',
        timestamp: '5 hours ago',
        likes: 67,
        stance: 'support'
      },
      {
        id: '5',
        user: 'Robert Johnson',
        content: 'I paid off my loans through hard work. Why should taxpayers fund this? What about people who chose not to go to college?',
        timestamp: '4 hours ago',
        likes: 34,
        stance: 'oppose'
      }
    ]
  },
  {
    id: '4',
    title: 'AI Regulation and Ethics Framework',
    description: 'Comprehensive legislation to regulate artificial intelligence development, ensuring ethical AI practices, data privacy protection, and preventing algorithmic bias in hiring and lending decisions.',
    category: 'Technology',
    location: 'National',
    timestamp: '8 hours ago',
    trending: false,
    supportCount: 945,
    opposeCount: 432,
    neutralCount: 203,
    comments: [
      {
        id: '6',
        user: 'Lisa Park',
        content: 'AI regulation is crucial before it\'s too late. We need protections for workers and consumers as this technology advances rapidly.',
        timestamp: '7 hours ago',
        likes: 29,
        stance: 'support'
      }
    ]
  },
  {
    id: '5',
    title: 'Immigration Reform and Border Security',
    description: 'Bipartisan proposal addressing comprehensive immigration reform, including pathways to citizenship for DACA recipients, enhanced border security measures, and streamlined legal immigration processes.',
    category: 'Immigration',
    location: 'National',
    timestamp: '12 hours ago',
    trending: false,
    supportCount: 1456,
    opposeCount: 1823,
    neutralCount: 567,
    comments: [
      {
        id: '7',
        user: 'Carlos Mendez',
        content: 'Finally, a balanced approach that addresses both security concerns and humanitarian needs. This could be the compromise we\'ve been waiting for.',
        timestamp: '10 hours ago',
        likes: 41,
        stance: 'support'
      }
    ]
  }
];

interface IssueFeedProps {
  onStanceChange: (issueId: string, stance: 'support' | 'oppose' | 'neutral') => void;
  onAddComment: (issueId: string, content: string) => void;
}

export function IssueFeed({ onStanceChange, onAddComment }: IssueFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [issues] = useState<Issue[]>(mockIssues);

  const categories = ['all', 'Healthcare', 'Environment', 'Education', 'Technology', 'Immigration', 'Economy'];
  
  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  const trendingIssues = issues.filter(issue => issue.trending);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Political Issues & Events</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{trendingIssues.length} trending</span>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>All Issues</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center space-x-1">
              <Flame className="h-4 w-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="my-stances">My Stances</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onStanceChange={onStanceChange}
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {trendingIssues.length > 0 ? (
              <div className="space-y-4">
                {trendingIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onStanceChange={onStanceChange}
                    onAddComment={onAddComment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trending issues right now</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-stances">
            <div className="text-center py-8 text-muted-foreground">
              <p>Your stances will appear here once you start taking positions on issues</p>
            </div>
          </TabsContent>

          <TabsContent value="following">
            <div className="text-center py-8 text-muted-foreground">
              <p>Follow other users to see their stances and activity here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}