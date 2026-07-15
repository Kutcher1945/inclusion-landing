import { MapPageEmbedded } from "@/components/sections/map-page-embedded";

export const metadata = { title: "Карта объектов — Паспортизация" };

export default function PassportsMapPage() {
  // Negative margins escape the layout's px-6 py-8 padding so the map fills edge-to-edge.
  // The relative+overflow-hidden container gives MapPageEmbedded its absolute positioning anchor.
  return (
    <div className="-mx-6 -mt-8 -mb-8 relative overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>
      <MapPageEmbedded />
    </div>
  );
}
