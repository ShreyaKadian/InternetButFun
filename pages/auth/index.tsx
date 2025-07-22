import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { useRouter } from "next/router";

import { auth } from "../../firebase/firebase";

import DefaultLayout from "@/layouts/default";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleAuth = async () => {
    setMessage(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        setMessage({ type: "success", text: "Account created!" });

        const idToken = await userCredential.user.getIdToken();

        const response = await fetch("http://localhost:8000/Auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to register user in database");
        }

        router.push("/register");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: "success", text: "Logged in successfully!" });
        router.push("/");
      }

      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto mt-20 rounded-xl bg-[#FFFCE1] shadow">
        <h2 className="text-xl font-semibold">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>

        <Input
          isClearable
          className="w-full"
          classNames={{
            base: "border border-black focus-within:border-pink-500",
            inputWrapper:
              "bg-transparent hover:bg-transparent focus-within:bg-transparent",
            input: "bg-transparent hover:bg-transparent focus:bg-transparent",
          }}
          label="Email"
          placeholder="Enter your email"
          type="email"
          value={email}
          variant="bordered"
          onChange={(e) => setEmail(e.target.value)}
          onClear={() => setEmail("")}
        />

        <Input
          isClearable
          className="w-full"
          classNames={{
            base: "border border-black focus-within:border-pink-500",
            inputWrapper:
              "bg-transparent hover:bg-transparent focus-within:bg-transparent",
            input: "bg-transparent hover:bg-transparent focus:bg-transparent",
          }}
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          variant="bordered"
          onChange={(e) => setPassword(e.target.value)}
          onClear={() => setPassword("")}
        />

        <Button
          className="w-full bg-black text-white hover:bg-gray-900 transition-colors"
          onClick={handleAuth}
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </Button>

        <Button
          className="text-sm text-black hover:text-pink-600"
          variant="light"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </Button>

        {message && (
          <div
            className={`text-sm text-center w-full ${
              message.type === "error"
                ? "text-red-600"
                : "text-green-600 font-medium"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
