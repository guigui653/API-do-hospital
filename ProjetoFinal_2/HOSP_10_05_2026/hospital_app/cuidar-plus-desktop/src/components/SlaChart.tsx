import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const data = [
  { setor: 'Enfermagem',   meta: 10, real: 8  },
  { setor: 'Hospitalidade',meta: 15, real: 18 },
  { setor: 'Nutrição',     meta: 20, real: 15 },
  { setor: 'Limpeza',      meta: 25, real: 30 },
  { setor: 'Manutenção',   meta: 45, real: 48 },
  { setor: 'Rouparia',     meta: 28, real: 22 },
];

const SlaChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        barCategoryGap="30%"
        barGap={3}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="setor"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          label={{ value: 'Minutos', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' }, offset: 15 }}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,75,73,0.04)' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
          formatter={(value: number, name: string) => [
            `${value} min`,
            name === 'meta' ? 'Tempo Meta' : 'Tempo Real',
          ]}
        />
        <Legend
          iconType="square"
          iconSize={10}
          formatter={(value) => value === 'meta' ? 'Tempo Meta' : 'Tempo Real'}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
        <Bar dataKey="meta" fill="#c7d8d6" radius={[4, 4, 0, 0]} name="meta" />
        <Bar dataKey="real" fill="#004b49" radius={[4, 4, 0, 0]} name="real" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SlaChart;
