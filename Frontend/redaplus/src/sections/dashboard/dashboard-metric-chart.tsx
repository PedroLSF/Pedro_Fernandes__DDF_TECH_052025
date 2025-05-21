import { ApexOptions } from 'apexcharts';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Card, { CardProps } from '@mui/material/Card';
import { alpha, useTheme } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

// Function to translate dates to Portuguese based on granularity
const formatDateToPt = (dateStr: string, granularity: 'hour' | 'day' | 'month'): string => {
    const date = new Date(dateStr);

    // Portuguese month names
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Portuguese month names (short versions)
    const shortMonths = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const shortMonth = shortMonths[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Format based on the specified granularity
    switch (granularity) {
        case 'hour':
            return `${day} ${shortMonth} ${hours}:${minutes}`;
        case 'day':
            return `${day} ${shortMonth}`;
        case 'month':
            return `${month} ${year}`;
        default:
            return `${day} ${shortMonth} ${year}`;
    }
};

// Add number formatting function for Portuguese locale
const formatNumberToPt = (value: number): string =>
    // Format with Portuguese thousands separator (dot) and decimal comma
    value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    ;

// Add the MetricUnit enum from the backend
enum MetricUnit {
    seconds = 'seconds',
    microseconds = 'microseconds',
    milliseconds = 'milliseconds',
    bytes = 'bytes',
    kilobytes = 'kilobytes',
    megabytes = 'megabytes',
    gigabytes = 'gigabytes',
    terabytes = 'terabytes',
    bits = 'bits',
    kilobits = 'kilobits',
    megabits = 'megabits',
    gigabits = 'gigabits',
    terabits = 'terabits',
    percent = 'percent',
    count = 'count',
    'seconds/seconds' = 'seconds/seconds',
    'bytes/second' = 'bytes/second',
    'kilobytes/second' = 'kilobytes/second',
    'megabytes/second' = 'megabytes/second',
    'gigabytes/second' = 'gigabytes/second',
    'terabytes/second' = 'terabytes/second',
    'bits/second' = 'bits/second',
    'kilobits/second' = 'kilobits/second',
    'megabits/second' = 'megabits/second',
    'gigabits/second' = 'gigabits/second',
    'terabits/second' = 'terabits/second',
    'count/second' = 'count/second',
    none = 'none',
}

// Function to get unit abbreviation
const getUnitAbbreviation = (unit: string): string => {
    switch (unit) {
        case MetricUnit.seconds:
            return 's';
        case MetricUnit.microseconds:
            return 'μs';
        case MetricUnit.milliseconds:
            return 'ms';
        case MetricUnit.bytes:
            return 'B';
        case MetricUnit.kilobytes:
            return 'KB';
        case MetricUnit.megabytes:
            return 'MB';
        case MetricUnit.gigabytes:
            return 'GB';
        case MetricUnit.terabytes:
            return 'TB';
        case MetricUnit.bits:
            return 'b';
        case MetricUnit.kilobits:
            return 'Kb';
        case MetricUnit.megabits:
            return 'Mb';
        case MetricUnit.gigabits:
            return 'Gb';
        case MetricUnit.terabits:
            return 'Tb';
        case MetricUnit.percent:
            return '%';
        case MetricUnit.count:
            return '';
        case MetricUnit['bytes/second']:
            return 'B/s';
        case MetricUnit['kilobytes/second']:
            return 'KB/s';
        case MetricUnit['megabytes/second']:
            return 'MB/s';
        case MetricUnit['gigabytes/second']:
            return 'GB/s';
        case MetricUnit['terabytes/second']:
            return 'TB/s';
        case MetricUnit['bits/second']:
            return 'b/s';
        case MetricUnit['kilobits/second']:
            return 'Kb/s';
        case MetricUnit['megabits/second']:
            return 'Mb/s';
        case MetricUnit['gigabits/second']:
            return 'Gb/s';
        case MetricUnit['terabits/second']:
            return 'Tb/s';
        case MetricUnit['count/second']:
            return '/s';
        case MetricUnit['seconds/seconds']:
            return 's/s';
        default:
            return '';
    }
};

interface MetricDataPoint {
    timestamp: string;
    min: number;
    max: number;
    avg: number;
    sum: number;
    unit: string;
}

interface Props extends CardProps {
    title?: string;
    subheader?: string;
    chart: {
        timestamps: string[];
        data: MetricDataPoint[];
        options?: ApexOptions;
        isLoading?: boolean;
        granularity: 'hour' | 'day' | 'month';
    };
}

// Unit conversion types
type UnitConversion = {
    value: string;
    label: string;
    factor: number;
    suffix: string;
};

// Group units by type for conversion options
const getUnitConversions = (baseUnit: string): UnitConversion[] => {
    // Data size units
    if (['bytes', 'kilobytes', 'megabytes', 'gigabytes', 'terabytes'].includes(baseUnit)) {
        return [
            { value: 'bytes', label: 'Bytes (B)', factor: 1, suffix: 'B' },
            { value: 'kilobytes', label: 'Kilobytes (KB)', factor: 1 / 1024, suffix: 'KB' },
            { value: 'megabytes', label: 'Megabytes (MB)', factor: 1 / (1024 * 1024), suffix: 'MB' },
            { value: 'gigabytes', label: 'Gigabytes (GB)', factor: 1 / (1024 * 1024 * 1024), suffix: 'GB' },
            { value: 'terabytes', label: 'Terabytes (TB)', factor: 1 / (1024 * 1024 * 1024 * 1024), suffix: 'TB' },
        ];
    }

    // Data rate units
    if ([
        'bytes/second', 'kilobytes/second', 'megabytes/second',
        'gigabytes/second', 'terabytes/second'
    ].includes(baseUnit)) {
        return [
            { value: 'bytes/second', label: 'Bytes/s (B/s)', factor: 1, suffix: 'B/s' },
            { value: 'kilobytes/second', label: 'KB/s', factor: 1 / 1024, suffix: 'KB/s' },
            { value: 'megabytes/second', label: 'MB/s', factor: 1 / (1024 * 1024), suffix: 'MB/s' },
            { value: 'gigabytes/second', label: 'GB/s', factor: 1 / (1024 * 1024 * 1024), suffix: 'GB/s' },
            { value: 'terabytes/second', label: 'TB/s', factor: 1 / (1024 * 1024 * 1024 * 1024), suffix: 'TB/s' },
        ];
    }

    // Bit-based units
    if (['bits', 'kilobits', 'megabits', 'gigabits', 'terabits'].includes(baseUnit)) {
        return [
            { value: 'bits', label: 'Bits (b)', factor: 1, suffix: 'b' },
            { value: 'kilobits', label: 'Kilobits (Kb)', factor: 1 / 1024, suffix: 'Kb' },
            { value: 'megabits', label: 'Megabits (Mb)', factor: 1 / (1024 * 1024), suffix: 'Mb' },
            { value: 'gigabits', label: 'Gigabits (Gb)', factor: 1 / (1024 * 1024 * 1024), suffix: 'Gb' },
            { value: 'terabits', label: 'Terabits (Tb)', factor: 1 / (1024 * 1024 * 1024 * 1024), suffix: 'Tb' },
        ];
    }

    // Bit rate units
    if ([
        'bits/second', 'kilobits/second', 'megabits/second',
        'gigabits/second', 'terabits/second'
    ].includes(baseUnit)) {
        return [
            { value: 'bits/second', label: 'Bits/s (b/s)', factor: 1, suffix: 'b/s' },
            { value: 'kilobits/second', label: 'Kb/s', factor: 1 / 1024, suffix: 'Kb/s' },
            { value: 'megabits/second', label: 'Mb/s', factor: 1 / (1024 * 1024), suffix: 'Mb/s' },
            { value: 'gigabits/second', label: 'Gb/s', factor: 1 / (1024 * 1024 * 1024), suffix: 'Gb/s' },
            { value: 'terabits/second', label: 'Tb/s', factor: 1 / (1024 * 1024 * 1024 * 1024), suffix: 'Tb/s' },
        ];
    }

    // Time units
    if (['microseconds', 'milliseconds', 'seconds'].includes(baseUnit)) {
        return [
            { value: 'microseconds', label: 'Microssegundos (μs)', factor: 1000000, suffix: 'μs' },
            { value: 'milliseconds', label: 'Milissegundos (ms)', factor: 1000, suffix: 'ms' },
            { value: 'seconds', label: 'Segundos (s)', factor: 1, suffix: 's' },
            { value: 'minutes', label: 'Minutos (min)', factor: 1 / 60, suffix: 'min' },
            { value: 'hours', label: 'Horas (h)', factor: 1 / 3600, suffix: 'h' },
        ];
    }

    // Default - no conversion options
    return [
        { value: baseUnit, label: `Original (${getUnitAbbreviation(baseUnit)})`, factor: 1, suffix: getUnitAbbreviation(baseUnit) }
    ];
};

// Convert value between units
const convertValue = (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return value;

    const conversions = getUnitConversions(fromUnit);
    const fromConversion = conversions.find(c => c.value === fromUnit);
    const toConversion = conversions.find(c => c.value === toUnit);

    if (!fromConversion || !toConversion) return value;

    // Convert to base unit first, then to target unit
    const baseValue = value / fromConversion.factor;
    return baseValue * toConversion.factor;
};

// Format value with appropriate unit conversion
const formatValueWithConversion = (value: number, baseUnit: string, displayUnit: string): string => {
    if (!baseUnit || !displayUnit) return formatNumberToPt(value);

    // Convert the value to the display unit
    const convertedValue = convertValue(value, baseUnit, displayUnit);

    // Get the suffix for the display unit
    const conversions = getUnitConversions(baseUnit);
    const displayConversion = conversions.find(c => c.value === displayUnit);
    const unitSuffix = displayConversion?.suffix || getUnitAbbreviation(baseUnit);

    // Format the converted value
    const formattedValue = formatNumberToPt(convertedValue);

    // Special handling for percent
    if (baseUnit === MetricUnit.percent) {
        return `${formattedValue}%`;
    }

    // Add suffix with a space
    if (unitSuffix) {
        return `${formattedValue} ${unitSuffix}`;
    }

    return formattedValue;
};

export default function DashboardMetricChart({ title, subheader, chart, ...other }: Props) {
    const { timestamps, data, options, isLoading, granularity } = chart;
    const theme = useTheme();

    // Get the base unit from the first data point
    const baseUnit = data.length > 0 ? data[0].unit : '';

    // Get available unit conversions
    const unitConversions = getUnitConversions(baseUnit);

    // State for selected display unit
    const [displayUnit, setDisplayUnit] = useState<string>(baseUnit);

    // Update displayUnit when the metric or baseUnit changes
    useEffect(() => {
        setDisplayUnit(baseUnit);
    }, [baseUnit]);

    // Handle unit conversion change
    const handleUnitChange = (event: SelectChangeEvent) => {
        setDisplayUnit(event.target.value);
    };

    // Translate all timestamps to Portuguese
    const translatedTimestamps = timestamps.map(dateStr => formatDateToPt(dateStr, granularity));

    const series = [
        {
            name: 'Mínimo',
            data: data.map((point) => point.min),
            color: theme.palette.primary.main,
        },
        {
            name: 'Média',
            data: data.map((point) => point.avg),
            color: theme.palette.warning.main,
        },
        {
            name: 'Máximo',
            data: data.map((point) => point.max),
            color: theme.palette.error.main,
        },
        {
            name: 'Soma',
            data: data.map((point) => point.sum),
            color: theme.palette.success.main,
        },
    ];

    const chartOptions = useChart({
        stroke: {
            width: 2,
        },
        xaxis: {
            categories: translatedTimestamps,
            labels: {
                style: {
                    fontSize: '11px',
                },
            },
            title: {
                text: 'Período',
                style: {
                    fontWeight: 600,
                },
            },
        },
        yaxis: {
            title: {
                text: unitConversions.find(uc => uc.value === displayUnit)?.label ||
                    (data.length > 0 ? `Valor da Métrica (${getUnitAbbreviation(data[0].unit)})` : 'Valor da Métrica'),
                style: {
                    fontWeight: 600,
                },
            },
            labels: {
                formatter: (value) => formatValueWithConversion(value, baseUnit, displayUnit),
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (value: number) => formatValueWithConversion(value, baseUnit, displayUnit),
                title: {
                    formatter: (seriesName: string) => `${seriesName}: `,
                },
            },
            x: {
                formatter: (value: number, { dataPointIndex }: { dataPointIndex: number }) => translatedTimestamps[dataPointIndex],
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            labels: {
                useSeriesColors: false,
            },
        },
        ...options,
    });

    return (
        <Card {...other}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">{title}</Typography>
                        <Tooltip title="O gráfico exibe valores mínimos, médios, máximos e a soma total dos valores para cada período.">
                            <Box component="span" sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                ml: 1,
                                color: 'text.secondary',
                                cursor: 'help',
                                bgcolor: (_theme) => alpha(_theme.palette.primary.main, 0.1),
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}>
                                ?
                            </Box>
                        </Tooltip>
                    </Box>
                }
                subheader={subheader}
                action={
                    unitConversions.length > 1 && (
                        <FormControl sx={{ minWidth: 150, mr: 2 }}>
                            <InputLabel id="unit-conversion-label">Unidade</InputLabel>
                            <Select
                                labelId="unit-conversion-label"
                                value={displayUnit}
                                onChange={handleUnitChange}
                                label="Unidade"
                                size="small"
                            >
                                {unitConversions.map((conversion) => (
                                    <MenuItem key={conversion.value} value={conversion.value}>
                                        {conversion.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )
                }
            />
            <Box sx={{ mt: 3, mx: 3, position: 'relative' }}>
                <Chart
                    dir="ltr"
                    type="line"
                    series={series}
                    options={chartOptions}
                    width="100%"
                    height={364}
                />
                {isLoading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: (_theme) => alpha(_theme.palette.background.default, 0.7),
                        zIndex: 1,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    mr: 1,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: (_theme) => `2px solid ${_theme.palette.primary.main}`,
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite',
                                }}
                            />
                            <Typography variant="body2">Carregando dados...</Typography>
                        </Box>
                    </Box>
                )}
            </Box>
            {/* eslint-disable-next-line */}
            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Card>
    );
} 