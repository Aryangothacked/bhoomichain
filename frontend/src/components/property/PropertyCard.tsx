
import type { PropertyData } from '../../types';
import { formatIndianCurrency, formatArea, timeAgo, truncateHash } from '../../utils/formatters';
import { Badge } from '../ui';
import { MapPin, User, Ruler, FileText } from 'lucide-react';

export const PropertyCard = ({ property, hash, timestamp, onClick }: { property: PropertyData, hash: string, timestamp: string, onClick?: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-border shadow-sm p-5 transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {property.propertyId}
          </span>
          <h3 className="text-lg font-bold text-text-primary mt-2">{property.ownerName}</h3>
        </div>
        <Badge variant={
          property.status === 'CLEAR' ? 'success' : 
          property.status === 'DISPUTED' ? 'warning' : 'danger'
        }>
          {property.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-sm text-text-secondary">
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {property.city} ({property.propertyType})</div>
        <div className="flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> {formatArea(property.area)}</div>
        <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> {property.surveyNo} / {property.khasraNo}</div>
        <div className="flex items-center gap-2 font-semibold text-text-primary">
          <span className="w-4 h-4 text-primary font-bold text-center">₹</span> {formatIndianCurrency(property.declaredValue)}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-border flex justify-between items-center text-xs">
        <span className="text-slate-500">Last updated {timeAgo(timestamp)}</span>
        <span className="font-mono text-slate-400" title={hash}>{truncateHash(hash)}</span>
      </div>
    </div>
  );
};
