import { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { IssueFeed } from './components/IssueFeed';
import { toast, Toaster } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleAuth = (userData: User) => {
    setUser(userData);
    toast.success(`Welcome to Stance, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  const handleStanceChange = (issueId: string, stance: 'support' | 'oppose' | 'neutral') => {
    toast.success(`Your stance has been recorded: ${stance.toUpperCase()}`);
  };

  const handleAddComment = (issueId: string, content: string) => {
    toast.success('Comment added successfully!');
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-red-50/30">
      <Header user={user} onLogout={handleLogout} />
      <main>
        <IssueFeed 
          onStanceChange={handleStanceChange}
          onAddComment={handleAddComment}
        />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}