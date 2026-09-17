import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BusStatus = "On Time" | "Delayed" | "Not Started" | "Completed";

export const BUS_STATUSES: BusStatus[] = ["On Time", "Delayed", "Not Started", "Completed"];

export type Driver = {
  id: string;
  name: string;
  phone: string;
  license_no: string | null;
  experience_years: number;
};

export type BusRoute = {
  id: string;
  name: string;
  start_point: string;
  destination: string;
  distance_km: number;
};

export type BusStop = {
  id: string;
  route_id: string;
  name: string;
  stop_order: number;
  arrival_time: string | null;
  lat: number;
  lng: number;
};

export type Schedule = {
  id: string;
  bus_id: string;
  shift: string;
  departure_time: string;
  arrival_time: string;
  days: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  category: string;
  created_at: string;
};

export type Bus = {
  id: string;
  bus_number: string;
  route_id: string | null;
  driver_id: string | null;
  capacity: number;
  occupancy: number;
  status: string;
  eta: string | null;
  current_lat: number | null;
  current_lng: number | null;
  routes: BusRoute | null;
  drivers: Driver | null;
};

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const busesQuery = queryOptions({
  queryKey: ["buses"],
  queryFn: () =>
    unwrap<Bus[]>(
      supabase
        .from("buses")
        .select(
          "id, bus_number, route_id, driver_id, capacity, occupancy, status, eta, current_lat, current_lng, routes(*), drivers(*)",
        )
        .order("bus_number"),
    ),
});

export const routesQuery = queryOptions({
  queryKey: ["routes"],
  queryFn: () => unwrap<BusRoute[]>(supabase.from("routes").select("*").order("name")),
});

export const stopsQuery = queryOptions({
  queryKey: ["bus_stops"],
  queryFn: () =>
    unwrap<BusStop[]>(supabase.from("bus_stops").select("*").order("stop_order")),
});

export const schedulesQuery = queryOptions({
  queryKey: ["schedules"],
  queryFn: () => unwrap<Schedule[]>(supabase.from("schedules").select("*").order("departure_time")),
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: () =>
    unwrap<Announcement[]>(
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    ),
});

export const driversQuery = queryOptions({
  queryKey: ["drivers"],
  queryFn: () => unwrap<Driver[]>(supabase.from("drivers").select("*").order("name")),
});

export const studentsQuery = queryOptions({
  queryKey: ["students"],
  queryFn: () =>
    unwrap<
      { id: string; full_name: string; student_id: string | null; email: string | null; department: string | null }[]
    >(
      supabase
        .from("profiles")
        .select("id, full_name, student_id, email, department")
        .order("full_name"),
    ),
});

export const COLLEGE_LOCATION = { lat: 11.0512, lng: 77.018, name: "College Campus" };

export function occupancyLabel(bus: Bus) {
  const free = Math.max(bus.capacity - bus.occupancy, 0);
  if (free === 0) return "Full";
  if (free <= 5) return `Almost full · ${free} seats left`;
  return `${free} seats available`;
}
