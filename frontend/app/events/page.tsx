"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import EventsContent from "./EventsContent.tsx";

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  );
}
