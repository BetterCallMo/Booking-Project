"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Event } from "@/types";

export default function EventsContent() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view events.");
          router.push("/login");
          return;
        }

        const res = await api.get<{ data: Event[] }>("get_all_organizer_events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(res.data.data);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to fetch events. Maybe your session expired.");
        setEvents([]);
      }
    };

    fetchEvents();
  }, [isClient, router]);

  if (!isClient) return null;
  
  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      {/* زرار إنشاء الحدث دايمًا ظاهر */}
      <button
        onClick={() => router.push("/events/create")}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Event
      </button>

      {/* عرض أي رسائل خطأ */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* حالة تحميل الأحداث */}
      {events === null && <p className="text-center">Loading events...</p>}

      {/* حالة عدم وجود أحداث */}
      {events !== null && events.length === 0 && (
        <p className="text-center">No events found.</p>
      )}

      {/* عرض الأحداث */}
      {events && events.length > 0 && (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="border p-3 rounded">
              <strong>{event.title}</strong> <br />
              <span className="text-sm text-gray-600">
                {new Date(event.date).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
