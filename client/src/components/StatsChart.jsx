import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const StatsChart = ({ data }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '350px', 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '20px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      marginTop: '30px' 
    }}>
      <h3 style={{ color: '#1e1b4b', marginBottom: '20px' }}>Rendimiento de Escaneos 📈</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEscaneos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 12}} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 12}} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="escaneos" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorEscaneos)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;