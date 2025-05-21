import { ApexOptions } from 'apexcharts';

import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';

import Chart, { useChart } from 'src/components/chart';

import { fData } from '../../utils/format-number';

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[][];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ApexOptions;
  };
}

export default function DashboardTrafficAreaVisualization({
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const { categories, series, options } = chart;

  const chartOptions = useChart({
    xaxis: {
      categories,
    },
    yaxis: {
      labels: {
        formatter: (val: number) => (fData(val) === '' ? '0 Mb' : fData(val)),
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => (fData(val) === '' ? '0 Mb' : fData(val)),
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ mt: 3, mx: 3 }}>
        <Chart
          dir="ltr"
          type="line"
          series={series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}
