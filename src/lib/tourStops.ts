import { supabase } from "@/lib/supabaseClient";

export type TourStop = {
  id: string;
  type: "places_to_eat" | "pasalubong_center";
  name: string;
  description: string | null;
  image_urls: string[] | null;
};

export async function listTourStops(type: TourStop["type"]) {
  const { data, error } = await supabase
    .from("tour_stops")
    .select("id, type, name, description, image_urls")
    .eq("type", type)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data as TourStop[];
}
