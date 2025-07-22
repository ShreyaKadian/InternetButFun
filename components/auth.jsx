import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/config/firebase/firebase";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { useRouter } from "next/router";

export const Auth = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] =
    (useState <
      {
        type: "error" | "success",
        text: string,
      }) |
    (null > null);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleAuth = async () => {
    setMessage(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage({ type: "success", text: "Account created!" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: "success", text: "Logged in successfully!" });
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold">
        {isSignUp ? "Create an Account" : "Welcome Back"}
      </h2>

      <Input
        isClearable
        className="w-full"
        label="Email"
        placeholder="Enter your email"
        type="email"
        variant="bordered"
        value={email}
        onClear={() => setEmail("")}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        isClearable
        className="w-full"
        label="Password"
        placeholder="Enter your password"
        type="password"
        variant="bordered"
        value={password}
        onClear={() => setPassword("")}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button color="primary" onClick={handleAuth} className="w-full">
        {isSignUp ? "Sign Up" : "Log In"}
      </Button>

      <Button
        variant="light"
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm"
      >
        {isSignUp
          ? "Already have an account? Log In"
          : "Don't have an account? Sign Up"}
      </Button>

      {message && (
        <div
          className={`text-sm text-center w-full ${
            message.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
