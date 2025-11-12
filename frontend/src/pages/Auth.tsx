import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";

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

interface AuthProps {
  onLogin: (user: UserData) => void;
}

interface AuthFormData {
  username: string;
  fullName?: string;
  email?: string;
  password: string;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    username: "",
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const url = isRegister
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Clear password
      setFormData({ ...formData, password: "" });

      onLogin(data);
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isRegister ? "Register" : "Login"}</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {isRegister && (
        <>
          <Input
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="mb-2"
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="mb-2"
          />
        </>
      )}

      <Input
        placeholder="Username"
        value={formData.username}
        onChange={(e) => handleChange("username", e.target.value)}
        className="mb-2"
      />
      <Input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        className="mb-4"
      />

      <Button onClick={handleSubmit} className="w-full mb-2">
        {isRegister ? "Register" : "Login"}
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setIsRegister(!isRegister);
          setError("");
        }}
      >
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </Button>
    </div>
  );
};

export default Auth;
