import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

// Helper component to handle map center updates and flyTo animations
const MapController = ({ position, onMoveEnd }) => {
  const map = useMap();
  const isFlying = useRef(false);

  useEffect(() => {
    if (position && !isFlying.current) {
        // Only fly if the distance is significant to avoid jitter during small drags if passing position back
        const currentCenter = map.getCenter();
        const dist = map.distance(currentCenter, position);
        if (dist > 100) { // arbitrary small distance
            isFlying.current = true;
            map.flyTo(position, map.getZoom(), { duration: 1.5 });
            map.once('moveend', () => { isFlying.current = false; });
        }
    }
  }, [position, map]);

  useMapEvents({
    moveend: () => {
        if (!isFlying.current) {
            onMoveEnd(map.getCenter());
        }
    }
  });

  return null;
};

const InteractiveMap = ({ position, setPosition, setAddress }) => {
  // Default to New Delhi (Blinkit hq-ish) or user pos
  const defaultPosition = { lat: 28.6139, lng: 77.2090 }; 
  const displayPosition = position ? { lat: position[0], lng: position[1] } : defaultPosition;
  const [isDragging, setIsDragging] = useState(false);

  const handleMapMoveEnd = (center) => {
    const lat = center.lat;
    const lng = center.lng;
    setPosition([lat, lng]);

    // Debounce or just fetch
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(data => {
        if(data.address){
            setAddress(data.address);
        }
    });
  };

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={displayPosition} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController position={position} onMoveEnd={handleMapMoveEnd} />
      </MapContainer>

      {/* Fixed Center Pin (Blinkit Style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none flex flex-col items-center justify-end pb-1/2">
        <div className="relative">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-600 drop-shadow-xl filter pb-1">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <div className="w-2 h-2 bg-black/30 rounded-full blur-[2px] absolute bottom-2 left-1/2 -translate-x-1/2"></div>
        </div>
        <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg -mt-12 whitespace-nowrap mb-2 transition-opacity">
            Order will be delivered here
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
