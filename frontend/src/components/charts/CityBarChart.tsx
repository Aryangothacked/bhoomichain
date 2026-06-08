import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const CityBarChart = (props: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={props.data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748B' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip formatter={(value: any, name: any, props: any) => [value, props.payload.fullCity]} />
        <Bar dataKey="count" fill="#1B4F8A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
