import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, MapPin } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { warehouses as warehouseOptions } from '../../data/mockData';

// Default Leaflet marker
const defaultIcon = L.icon({
  iconUrl: marker1x,
  iconRetinaUrl: marker2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER = [20.5937, 78.9629];

const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    const nextCenter = Array.isArray(center) ? center : DEFAULT_CENTER;
    map.flyTo(nextCenter, Math.max(map.getZoom(), 4), { animate: true, duration: 0.75 });
  }, [center, map]);

  return null;
};

ChangeMapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
};

const WarehouseMap = ({ onWarehouseSelect, selectedWarehouseId }) => {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => setIsMapReady(true), []);

  const selectedWarehouse = useMemo(
    () => warehouseOptions.find((w) => w.id === selectedWarehouseId),
    [selectedWarehouseId]
  );

  const mapCenter = useMemo(() => {
    if (selectedWarehouse?.coordinates) return selectedWarehouse.coordinates;
    if (warehouseOptions[0]?.coordinates) return warehouseOptions[0].coordinates;
    return DEFAULT_CENTER;
  }, [selectedWarehouse]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-burrow-text-primary">Find Nearby Warehouses</h3>

      <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200">
        {isMapReady ? (
          <MapContainer center={mapCenter} zoom={4} scrollWheelZoom className="h-full w-full">
            <ChangeMapView center={mapCenter} />
            <TileLayer
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {warehouseOptions.map((warehouse) => (
              <Marker
                key={warehouse.id}
                position={warehouse.coordinates}
                eventHandlers={{ click: () => onWarehouseSelect?.(warehouse) }}
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
          <div className="flex flex-col items-center justify-center h-full text-burrow-primary">
            <MapPin className="h-10 w-10 mb-2" />
            <p>Loading map...</p>
          </div>
        )}
      </div>

      <div
        className={`rounded-lg border p-4 transition-colors duration-200 ${
          selectedWarehouse
            ? 'bg-green-50 border-green-400'
            : 'bg-burrow-background border-burrow-primary/30'
        }`}
      >
        {selectedWarehouse ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-burrow-text-primary">Warehouse Selected</span>
            </div>
            <p className="font-semibold text-burrow-text-primary">{selectedWarehouse.name}</p>
            <p className="text-sm text-burrow-text-secondary">{selectedWarehouse.address}</p>
          </div>
        ) : (
          <p className="text-sm text-burrow-text-secondary text-center">
            Select a warehouse to view its details here.
          </p>
        )}
      </div>
    </div>
  );
};

WarehouseMap.propTypes = {
  onWarehouseSelect: PropTypes.func,
  selectedWarehouseId: PropTypes.string,
};

export default WarehouseMap;
