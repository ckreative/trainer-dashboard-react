---
description: Generate Recharts visualization with responsive design
---

# Generate Chart Command

Generate a Recharts data visualization component with responsive design, dark mode support, and proper TypeScript typing.

## Usage

When invoked, gather these parameters:
1. **Chart Type**:
   - Line Chart (trends over time)
   - Bar Chart (comparisons)
   - Area Chart (cumulative data)
   - Pie Chart (proportions)
   - Composed Chart (multiple data series)
2. **Data Structure** - What data will be displayed and its format
3. **Axes** - X and Y axis configuration
4. **Features** - Tooltip, legend, grid, animations
5. **Styling** - Colors, theme integration

## Chart Generation Steps

### 1. Import Required Components

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
```

### 2. Define Data Interface

```typescript
interface ChartDataPoint {
  // Define based on data structure
  date: string;      // or 'name', 'category', etc.
  value: number;     // primary metric
  value2?: number;   // secondary metric if needed
  label?: string;    // for display
}

interface {ChartName}Props {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  isLoading?: boolean;
}
```

### 3. Create Chart Component Structure

```typescript
export function {ChartName}({ data, title, description, isLoading }: {ChartName}Props) {
  // Empty state
  if (!isLoading && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {/* Chart goes here */}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## Chart Type Templates

### 1. Line Chart (Time Series)

```typescript
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesData {
  date: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title?: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function TimeSeriesChart({
  data,
  title,
  description,
  xAxisLabel = 'Date',
  yAxisLabel = 'Value',
}: TimeSeriesChartProps) {
  // Format data if needed
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Format date or other transformations
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name={yAxisLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### 2. Bar Chart (Comparisons)

```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartData {
  category: string;
  value: number;
  value2?: number;
}

interface ComparisonBarChartProps {
  data: BarChartData[];
  title?: string;
  description?: string;
}

export function ComparisonBarChart({ data, title, description }: ComparisonBarChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="category"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Primary"
            />
            {/* Add second bar if data has value2 */}
            <Bar
              dataKey="value2"
              fill="hsl(var(--secondary))"
              radius={[4, 4, 0, 0]}
              name="Secondary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### 3. Area Chart (Cumulative)

```typescript
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartData {
  date: string;
  value: number;
}

interface CumulativeAreaChartProps {
  data: AreaChartData[];
  title?: string;
  description?: string;
}

export function CumulativeAreaChart({ data, title, description }: CumulativeAreaChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### 4. Pie Chart (Proportions)

```typescript
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

interface ProportionPieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ProportionPieChart({ data, title, description }: ProportionPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## Advanced Features

### 1. Custom Tooltip

```typescript
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Usage in chart:
<Tooltip content={<CustomTooltip />} />
```

### 2. Data Transformation with useMemo

```typescript
const chartData = useMemo(() => {
  // Transform raw data into chart format
  return rawData.map(item => ({
    date: format(new Date(item.createdAt), 'MMM dd'),
    value: item.amount,
    // Calculate derived values
    average: calculateAverage(item.values),
  }));
}, [rawData]);
```

### 3. Responsive Height

```typescript
const [chartHeight, setChartHeight] = useState(300);

useEffect(() => {
  const updateHeight = () => {
    if (window.innerWidth < 768) {
      setChartHeight(200);
    } else {
      setChartHeight(300);
    }
  };

  updateHeight();
  window.addEventListener('resize', updateHeight);
  return () => window.removeEventListener('resize', updateHeight);
}, []);

<ResponsiveContainer width="100%" height={chartHeight}>
```

### 4. Multiple Data Series

```typescript
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="revenue"
    stroke="hsl(var(--chart-1))"
    strokeWidth={2}
    name="Revenue"
  />
  <Line
    type="monotone"
    dataKey="profit"
    stroke="hsl(var(--chart-2))"
    strokeWidth={2}
    name="Profit"
  />
  <Line
    type="monotone"
    dataKey="expenses"
    stroke="hsl(var(--chart-3))"
    strokeWidth={2}
    name="Expenses"
  />
</LineChart>
```

## Theme Integration

### Using CSS Variables

```typescript
// Define chart colors in your Tailwind config or globals.css
// --chart-1: 220 70% 50%;
// --chart-2: 160 60% 45%;
// --chart-3: 30 80% 55%;
// --chart-4: 280 65% 60%;
// --chart-5: 340 75% 55%;

// Use in charts
<Line stroke="hsl(var(--chart-1))" />
<Bar fill="hsl(var(--chart-2))" />
```

### Dark Mode Support

```typescript
<CartesianGrid
  strokeDasharray="3 3"
  className="stroke-muted"
/>
<XAxis
  tick={{ fill: 'hsl(var(--muted-foreground))' }}
  stroke="hsl(var(--border))"
/>
<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    color: 'hsl(var(--foreground))',
  }}
/>
```

## Best Practices

### 1. Data Handling
- Always validate data exists before rendering chart
- Show loading state while fetching data
- Show empty state when no data available
- Transform data with useMemo for performance

### 2. Responsiveness
- Always use ResponsiveContainer
- Set appropriate height (300-400px typically)
- Consider different heights for mobile
- Test on various screen sizes

### 3. Accessibility
- Include descriptive title and description
- Use semantic color scheme
- Ensure sufficient color contrast
- Provide data table alternative if needed

### 4. Performance
- Use useMemo for data transformations
- Limit number of data points (aggregate if needed)
- Disable animations for large datasets
- Consider virtualization for very large datasets

### 5. Styling
- Use theme CSS variables for colors
- Ensure dark mode compatibility
- Match shadcn/ui design system
- Keep consistent spacing and margins

### 6. Tooltips and Labels
- Format numbers appropriately (commas, decimals)
- Format dates consistently
- Keep labels concise
- Use custom tooltips for complex data

## Common Use Cases

**Analytics Dashboard:**
"Generate a line chart showing user signups over the last 30 days"

**Performance Metrics:**
"Generate a bar chart comparing monthly revenue across different products"

**Status Overview:**
"Generate a pie chart showing distribution of task statuses (completed, in progress, pending)"

**Trend Analysis:**
"Generate an area chart showing cumulative sales growth over the year"

**Multi-metric Comparison:**
"Generate a composed chart with line for revenue and bars for expenses"

## Example Invocations

"Generate a line chart for tracking post engagement over time"

"Generate a bar chart comparing template usage across different categories"

"Generate a pie chart showing post status distribution (draft, scheduled, published)"

"Generate an area chart for cumulative follower growth"

## After Generation

1. Test with empty data array
2. Test with loading state
3. Verify responsive behavior on mobile
4. Check dark mode appearance
5. Ensure tooltip displays correctly
6. Verify axis labels are readable
7. Test with realistic data volumes
8. Use Chrome DevTools MCP to visually verify the chart renders correctly
