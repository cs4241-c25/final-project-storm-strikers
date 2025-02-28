"use client";

import { Building } from "@/lib/models/building";
import { AdvancedMarker, Map as GMap } from "@vis.gl/react-google-maps";

export default function MyGoogleMap({ buildings }: { buildings: Building[] }) {
  return (
    <div className="w-10 h-10">
      <GMap
        mapId="bf51a910020fa25a"
        defaultZoom={5}
        defaultCenter={{ lat: 42.3241, lng: -71.1676 }} // Centered around the middle hospital
        gestureHandling="greedy"
        disableDefaultUI={true}
      >
        {buildings.map((building) => (
          <div key={String(building._id)}>
            {/* Hospital Marker */}
            <AdvancedMarker position={building.coordinates} />

            {/* Parking Marker */}
            <AdvancedMarker position={building.parking} />

            {/* Drop-Off Marker */}
            <AdvancedMarker position={building.dropOff} />
          </div>
        ))}
      </GMap>
    </div>
  );
}
