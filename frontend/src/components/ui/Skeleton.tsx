interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, flexShrink: 0, ...style }}
  />
);

/** A pre-built skeleton for a metric card */
export const MetricCardSkeleton = () => (
  <div style={{
    background: 'white', border: '1px solid #E2E8F0',
    borderRadius: 12, padding: '20px 24px',
  }}>
    <Skeleton width={40} height={40} borderRadius="50%" />
    <Skeleton width="60%" height={32} style={{ marginTop: 12 }} />
    <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
  </div>
);

/** A skeleton row for a table / activity feed */
export const RowSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton width={60} height={20} borderRadius={4} />
        <Skeleton height={14} />
        <Skeleton width={80} height={14} />
      </div>
    ))}
  </div>
);

export default Skeleton;
