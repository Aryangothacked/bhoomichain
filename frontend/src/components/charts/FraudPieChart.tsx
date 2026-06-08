import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const FraudPieChart = ({ data }: { data: any[] }) => {
  const chartData = useMemo(() => {
    let above = 0;
    let below = 0;
    data.forEach(d => {
      // Primitive logic to chart the rejects
      if (d.reason.includes('Below minimum')) below++;
      else above++;
    });
    
    if (above === 0 && below === 0) return [];
    
    return [
      { name: 'Circle Rate Evasion', value: below },
      { name: 'Other Fraud', value: above }
    ];
  }, [data]);

  const COLORS = ['#DC2626', '#F59E0B'];

  if (chartData.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No data</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
