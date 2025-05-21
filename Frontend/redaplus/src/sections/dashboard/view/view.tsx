'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Container, Grid, ListItemText, Card } from '@mui/material';
import DashboardAreaVisualization from '../dashboard-area-visualization';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';
import { LoadingScreen } from 'src/components/loading-screen';
import axiosInstance, { endpoints } from 'src/utils/axios';
import DashboardDeviceVisualization from '../dashboard-device-visualization';

type EssayPerMonth = {
  month: string; // "2025-01"
  count: number;
};

type EssayThemeCount = {
  theme: string;
  count: number;
};

export default function DashboardView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  const [essaysPerMonth, setEssaysPerMonth] = useState<EssayPerMonth[]>([]);
  const [essaysPerTheme, setEssaysPerTheme] = useState<EssayThemeCount[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [perMonthRes, perThemeRes] = await Promise.all([
          axiosInstance.get(endpoints.dashboard.essaysPerMonth),
          axiosInstance.get(endpoints.dashboard.essaysPerTheme),
        ]);

        setEssaysPerMonth(perMonthRes.data);
        setEssaysPerTheme(perThemeRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  const areaCategories = essaysPerMonth.map((item) => item.month);
  const areaSeries = [
    {
      name: 'Redações',
      data: essaysPerMonth.map((item) => item.count),
    },
  ];

  const pieSeriesFormatted = essaysPerTheme.map((item) => ({
    label: item.theme,
    value: item.count,
  }));

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} mb={4}>
          <ListItemText
            primary={`Olá! Bem-vindo(a) de volta, ${user?.name} 👋`}
            primaryTypographyProps={{ typography: 'h4' }}
            secondaryTypographyProps={{ typography: 'h6' }}
          />
        </Grid>

        {/* Gráfico de Área */}
        <Grid xs={12} md={12} lg={12}>
          <Card>
            <DashboardAreaVisualization
              sx={{ height: '500px' }}
              title="Redações por mês"
              chart={{
                categories: areaCategories,
                series: areaSeries,
              }}
            />
          </Card>
        </Grid>

        <Grid xs={12} md={12} lg={12} mt={2}>
          <DashboardDeviceVisualization
            title="Distribuição de temas das redações"
            chart={{
              series: pieSeriesFormatted,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
