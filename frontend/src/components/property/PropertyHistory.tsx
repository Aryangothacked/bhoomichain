import React from 'react';
import type { Block } from '../../types';
import { Badge } from '../ui';
import { timeAgo, truncateHash, formatIndianCurrency } from '../../utils/formatters';

export const PropertyHistory = ({ blocks }: { blocks: Block[] }) => {
  // Sort reverse chronological
  const sorted = [...blocks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 my-6 ml-4">
      {sorted.map((block, i) => (
        <div key={block.hash} className="relative">
          <div className="absolute w-4 h-4 bg-primary rounded-full -left-[35px] top-1 border-4 border-white shadow-sm ring-1 ring-slate-200"></div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <Badge variant={block.data.eventType === 'REGISTRATION' ? 'primary' : block.data.eventType === 'SALE' ? 'success' : 'warning'}>
                  {block.data.eventType}
                </Badge>
                <span className="text-sm font-semibold text-slate-700">{timeAgo(block.timestamp)}</span>
              </div>
              <span className="font-mono text-xs text-slate-400">Block #{block.blockNumber}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500">Owner</p>
                <p className="text-sm font-medium">{block.data.newOwner || block.data.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Declared Value</p>
                <p className="text-sm font-medium">{formatIndianCurrency(block.data.declaredValue)}</p>
              </div>
            </div>
            
            {block.data.notes && (
              <div className="mt-3 p-3 bg-white border border-slate-200 rounded text-sm text-slate-600 italic">
                "{block.data.notes}"
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="font-mono text-xs text-slate-500 break-all">Hash: {block.hash}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
