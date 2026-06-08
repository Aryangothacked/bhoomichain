import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: any[];
  height?: number | string;
}

export const PropertyMap = ({ properties, height = 500 }: PropertyMapProps) => {
  const getMarkerIcon = (status: string) => {
    let color = '#64748B'; // Default gray
    if (status === 'CLEAR') color = '#16A34A'; // Green
    if (status === 'DISPUTED') color = '#D97706'; // Orange
    if (status === 'COURT_FREEZE') color = '#DC2626'; // Red

    const html = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`;
    
    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7]
    });
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height, width: '100%', borderRadius: '12px', zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.filter(p => p.gpsLat && p.gpsLng).map((p, idx) => (
        <Marker key={idx} position={[p.gpsLat, p.gpsLng]} icon={getMarkerIcon(p.status)}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>{p.propertyId}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{p.ownerName}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>{p.city}</div>
              <span style={{ 
                display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                backgroundColor: p.status === 'CLEAR' ? '#DEF7EC' : p.status === 'DISPUTED' ? '#FEF3C7' : '#FDE8E8',
                color: p.status === 'CLEAR' ? '#03543F' : p.status === 'DISPUTED' ? '#92400E' : '#9B1C1C'
              }}>
                {p.status || 'UNKNOWN'}
              </span>
              {p.declaredValue && (
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  ₹{p.declaredValue.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default PropertyMap;
