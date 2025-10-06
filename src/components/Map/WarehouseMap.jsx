import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { warehouses as warehouseOptions } from '../../data/mockData';

const defaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER = [20.5937, 78.9629];

const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) {
      return;
    }

    const nextCenter = Array.isArray(center) ? center : DEFAULT_CENTER;
    map.flyTo(nextCenter, Math.max(map.getZoom(), 5), {
      animate: true,
      duration: 0.75
    });
  }, [center, map]);

  return null;
};

ChangeMapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number)
};

const WarehouseMap = ({ onWarehouseSelect, selectedWarehouseId }) => {
  const [userLocation, setUserLocation] = useState('');
  const [nearbyWarehouses, setNearbyWarehouses] = useState(warehouseOptions);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  const handleLocationSearch = () => {
    const searchTerm = userLocation.toLowerCase();

    if (!searchTerm) {
      setNearbyWarehouses(warehouseOptions);
      return;
    }

    const filtered = warehouseOptions.filter((warehouse) => {
      const haystack = `${warehouse.name} ${warehouse.address}`.toLowerCase();
      return haystack.includes(searchTerm);
    });

    setNearbyWarehouses(filtered.length > 0 ? filtered : warehouseOptions);
  };

  const selectedWarehouse = useMemo(
    () => warehouseOptions.find((warehouse) => warehouse.id === selectedWarehouseId),
    [selectedWarehouseId]
  );

  const mapCenter = useMemo(() => {
    if (selectedWarehouse?.coordinates) {
      return selectedWarehouse.coordinates;
    }

    if (nearbyWarehouses.length > 0 && nearbyWarehouses[0].coordinates) {
      return nearbyWarehouses[0].coordinates;
    }

    return DEFAULT_CENTER;
  }, [nearbyWarehouses, selectedWarehouse]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-burrow-text-primary mb-4">Find Nearby Warehouses</h3>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter your location (city, pincode, area)"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burrow-primary focus:border-transparent transition-shadow"
            />
          </div>
          <button
            onClick={handleLocationSearch}
            className="px-6 py-2 bg-burrow-primary text-white rounded-lg hover:bg-burrow-accent transition-colors flex items-center gap-2 shadow-sm"
          >
            <Navigation className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      <div className="bg-burrow-background rounded-lg h-64 mb-6 overflow-hidden">
        {isMapReady ? (
          <MapContainer
            center={mapCenter}
            zoom={5}
            scrollWheelZoom
            className="h-full w-full"
          >
            <ChangeMapView center={mapCenter} />
            <TileLayer
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {nearbyWarehouses.map((warehouse) => (
              <Marker
                key={warehouse.id}
                position={warehouse.coordinates}
                eventHandlers={{
                  click: () => onWarehouseSelect?.(warehouse)
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-burrow-text-primary">{warehouse.name}</p>
                    <p className="text-burrow-text-secondary mt-1">{warehouse.address}</p>
                    <p className="text-gray-500 mt-1 text-xs">
                      Capacity: {warehouse.capacity} · Hours: {warehouse.operatingHours}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-burrow-text-secondary">
            <MapPin className="h-10 w-10 mb-2 text-burrow-primary" />
            <p>Loading map...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default WarehouseMap;

WarehouseMap.propTypes = {
  onWarehouseSelect: PropTypes.func,
  selectedWarehouseId: PropTypes.string,
};
