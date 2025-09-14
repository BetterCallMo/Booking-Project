"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post("/auth/signup", form);
    alert("Registered successfully!");
    router.push("/login");
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    alert(err.response?.data?.message || "Registration failed");
  }
};


  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Register
        </button>
      </form>
    </div>
  );
}
