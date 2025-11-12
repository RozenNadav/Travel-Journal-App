import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, User, Calendar, Edit2, Check, X, LogOut, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { API_BASE_URL } from "@/config";
import Auth from "./Auth";

interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
  location: string;
  joinDate: string;
}

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = (user: UserData) => {
    setUserData(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleCancel = () => setIsEditing(false);

  const handleChange = (field: keyof UserData, value: string) => {
    if (!userData) return;
    setUserData({ ...userData, [field]: value });
  };

  const handleAvatarChange = () => {
    const newAvatar = prompt("Enter avatar URL:");
    if (newAvatar) handleChange("avatar", newAvatar);
  };

  const handleSave = async () => {
    if (!userData) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Update failed:", errData.error || "Unknown error");
        return;
      }

      const data = await res.json();
      setUserData(data);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (!isLoggedIn || !userData) return <Auth onLogin={handleLogin} />;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-2xl">
          <CardHeader className="relative">
            <div className="flex items-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar} alt={userData.username} />
                  <AvatarFallback>{userData.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleAvatarChange}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="ml-4">
                <CardTitle className="text-2xl font-bold">{userData.fullName}</CardTitle>
                <div className="flex items-center text-muted-foreground mt-2">
                  <User className="h-4 w-4 mr-2" />
                  @{userData.username}
                </div>
              </div>
            </div>

            <div className="flex gap-2 absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={isEditing ? handleSave : handleEditToggle}>
                {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              </Button>
              {isEditing && (
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {isEditing ? (
                <Textarea
                  value={userData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about yourself"
                  className="w-full"
                />
              ) : (
                <div className="text-muted-foreground">{userData.bio}</div>
              )}

              <Separator />

              <div className="grid gap-4">
                {(["email", "fullName", "username", "location"] as (keyof UserData)[]).map((field) => (
                  <div key={field} className="flex items-center">
                    {field === "email" && <Mail className="h-4 w-4 mr-2 text-muted-foreground" />}
                    {field === "fullName" && <User className="h-4 w-4 mr-2 text-muted-foreground" />}
                    {field === "username" && <User className="h-4 w-4 mr-2 text-muted-foreground" />}
                    {field === "location" && <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />}
                    <Label className="mr-2 w-20">{field.charAt(0).toUpperCase() + field.slice(1)}:</Label>
                    {isEditing ? (
                      <Input
                        value={userData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="max-w-xs"
                      />
                    ) : (
                      <span>{userData[field]}</span>
                    )}
                  </div>
                ))}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Label className="mr-2 w-20">Joined:</Label>
                  <span>{userData.joinDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
