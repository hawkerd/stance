"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { UserService } from "@/service/UserService";
import { AuthService } from "@/service/AuthService";
import { ImageService } from "@/service/ImageService";
import SettingsTabs from "@/components/settings/SettingsTabs";
import AccountInfoSection from "@/components/settings/AccountInfoSection";
import PasswordChangeSection from "@/components/settings/PasswordChangeSection";
import ProfileAvatarSection from "@/components/settings/ProfileAvatarSection";
import ProfileBioSection from "@/components/settings/ProfileBioSection";
import SaveCancelButtons from "@/components/settings/SaveCancelButtons";

type SettingsTab = "account" | "profile";

export default function SettingsPage() {
  const { isAuthenticated, initialized } = useAuth();
  const { user, profile, loading: userLoading, refreshUser } = useUser();
  const router = useRouter();
  const api = useAuthApi();
  const userService = new UserService();
  const authService = new AuthService();
  const imageService = new ImageService();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Track original values
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalFullName, setOriginalFullName] = useState("");

  // Track if sections have been edited
  const [accountInfoEdited, setAccountInfoEdited] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [profileEdited, setProfileEdited] = useState(false);

  // Username availability checking
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Profile fields
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Track original profile values
  const [originalBio, setOriginalBio] = useState("");
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router]);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFullName(user.full_name || "");
      setOriginalUsername(user.username || "");
      setOriginalEmail(user.email || "");
      setOriginalFullName(user.full_name || "");
    }
  }, [user]);

  // Initialize profile data
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setOriginalBio(profile.bio || "");
      setOriginalAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  // Track account info changes
  useEffect(() => {
    if (username !== originalUsername || email !== originalEmail || fullName !== originalFullName) {
      setAccountInfoEdited(true);
    }
  }, [username, email, fullName, originalUsername, originalEmail, originalFullName]);

  // Track password changes
  useEffect(() => {
    if (currentPassword || newPassword || confirmPassword) {
      setPasswordEdited(true);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  // Check username availability with debouncing
  useEffect(() => {
    // Don't check if username hasn't changed or is empty
    if (!username || username === originalUsername) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError(null);

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const isTaken = await userService.isUsernameTaken(api, username);
        setUsernameAvailable(!isTaken);
        if (isTaken) {
          setUsernameError("Username is already taken");
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Error checking username availability");
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username, originalUsername, api]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setProfileEdited(true);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
    setProfileEdited(true);
  };

  const handleSaveAccount = async () => {
    // Validate username is available if changed
    if (username !== originalUsername && usernameAvailable === false) {
      alert("Please choose an available username");
      return;
    }

    try {
      // Update user account info
      await userService.updateCurrentUser(api, username, fullName, email);
      
      // Refresh user context to get updated data
      await refreshUser();
      
      // Update original values to match new values
      setOriginalUsername(username);
      setOriginalEmail(email);
      setOriginalFullName(fullName);
      
      setAccountInfoEdited(false);
    } catch (error: any) {
      console.error("Error updating account:", error);
    }
  };

  const handleSavePassword = async () => {
    // Validate password fields if changing password
    if (!currentPassword) {
      alert("Please enter your current password");
      return;
    }
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      await authService.changePassword(api, currentPassword, newPassword);
      
      alert("Password changed successfully!");
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordEdited(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.detail || "Failed to change password. Please check your current password.");
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) {
      return;
    }

    try {
      let newAvatarUrl = avatarUrl;

      // If there's a new avatar file, upload it first
      if (avatarFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64Content = base64.split(',')[1];
            resolve(base64Content);
          };
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(avatarFile);
        const base64Content = await base64Promise;

        // Upload image with profile_id
        const imageResponse = await imageService.createImage(
          api,
          avatarFile.type,
          base64Content,
          undefined, // entityId
          undefined, // stanceId
          profile.id  // profileId
        );

        newAvatarUrl = imageResponse.publicUrl;
      }

      // Only pass fields that have changed
      const bioChanged = bio !== originalBio;
      const avatarChanged = newAvatarUrl !== originalAvatarUrl;

      // Update profile with only changed fields
      await userService.updateProfile(
        api, 
        user.id, 
        bioChanged ? bio : undefined,
        avatarChanged ? newAvatarUrl : undefined,
        undefined // pinned_stance_id not changed here
      );

      // Refresh user context to get updated profile data
      await refreshUser();

      // Update original values
      setOriginalBio(bio);
      setOriginalAvatarUrl(newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileEdited(false);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(error.response?.data?.detail || "Failed to save profile. Please try again.");
    }
  };

  const handleCancelAccount = () => {
    setUsername(originalUsername);
    setEmail(originalEmail);
    setFullName(originalFullName);
    setAccountInfoEdited(false);
  };

  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordEdited(false);
  };

  const handleCancelProfile = () => {
    setBio(originalBio);
    setAvatarUrl(originalAvatarUrl);
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileEdited(false);
    
    // Reset the file input
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (!initialized || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start overflow-hidden p-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500">Manage your account and profile</p>
          </div>

          {/* Tab Switcher */}
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <AccountInfoSection
                username={username}
                email={email}
                fullName={fullName}
                originalUsername={originalUsername}
                usernameChecking={usernameChecking}
                usernameAvailable={usernameAvailable}
                usernameError={usernameError}
                onUsernameChange={setUsername}
                onEmailChange={setEmail}
                onFullNameChange={setFullName}
              />

              {/* Account Info Action Buttons */}
              {accountInfoEdited && (
                <SaveCancelButtons
                  onSave={handleSaveAccount}
                  onCancel={handleCancelAccount}
                  saveLabel="Save Account Info"
                />
              )}

              <PasswordChangeSection
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
              />

              {/* Password Action Buttons */}
              {passwordEdited && (
                <SaveCancelButtons
                  onSave={handleSavePassword}
                  onCancel={handleCancelPassword}
                  saveLabel="Save Password"
                />
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <ProfileAvatarSection
                username={user.username}
                avatarUrl={avatarUrl}
                avatarPreview={avatarPreview}
                onAvatarChange={handleAvatarChange}
              />

              <ProfileBioSection
                bio={bio}
                onBioChange={handleBioChange}
              />

              {/* Profile Action Buttons */}
              {profileEdited && (
                <SaveCancelButtons
                  onSave={handleSaveProfile}
                  onCancel={handleCancelProfile}
                  saveLabel="Save Profile"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
