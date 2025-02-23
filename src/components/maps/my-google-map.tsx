"use client";

import { APIProvider, Map as GMap } from "@vis.gl/react-google-maps";

export default function MyGoogleMap() {
  return (
    <div className="w-10 h-10">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY ?? ""}>
        <GMap
          mapId={"bf51a910020fa25a"}
          defaultZoom={5}
          defaultCenter={{ lat: 53, lng: 10 }}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        />
      </APIProvider>
    </div>
  );
}
