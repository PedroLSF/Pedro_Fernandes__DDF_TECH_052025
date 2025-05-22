'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import { Grid, Card, Container, ListItemText } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardAreaVisualization from '../dashboard-area-visualization';
import DashboardDeviceVisualization from '../dashboard-device-visualization';

type EssayPerMonth = {
  month: string;
  count: number;
};

type EssayThemeCount = {
  theme: string;
  count: number;
};

type EssayStatusCount = {
  status: string;
  count: number;
};

type EssayAvgNote = {
  month: string;
  avg: number;
};

type PlanningPerMonthItem = {
  month: string;
  count: number;
};

export default function DashboardView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  const [essaysPerMonth, setEssaysPerMonth] = useState<EssayPerMonth[]>([]);
  const [essaysPerTheme, setEssaysPerTheme] = useState<EssayThemeCount[]>([]);
  const [essaysPerStatus, setEssaysPerStatus] = useState<EssayStatusCount[]>([]);
  const [essaysAvgNote, setEssaysAvgNote] = useState<EssayAvgNote[]>([]);
  const [planningsPerMonth, setPlanningsPerMonth] = useState<PlanningPerMonthItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userIdQuery = user && !user.is_master ? `?userId=${user.id}` : '';

        const [perMonthRes, perThemeRes, perStatusRes, avgNoteRes, planningsPerMonthRes] =
          await Promise.all([
            axiosInstance.get(`${endpoints.dashboard.essaysPerMonth}${userIdQuery}`),
            axiosInstance.get(`${endpoints.dashboard.essaysPerTheme}${userIdQuery}`),
            axiosInstance.get(`${endpoints.dashboard.essaysPerStatus}${userIdQuery}`),
            axiosInstance.get(`${endpoints.dashboard.essaysAvg}${userIdQuery}`),
            axiosInstance.get(`${endpoints.dashboard.planningPerMonth}${userIdQuery}`),
          ]);

        setEssaysPerMonth(perMonthRes.data);
        setEssaysPerTheme(perThemeRes.data);
        setEssaysPerStatus(perStatusRes.data);
        setEssaysAvgNote(avgNoteRes.data);
        setPlanningsPerMonth(planningsPerMonthRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) return <LoadingScreen />;

  // Gráfico de Redações por mês
  const areaCategories = essaysPerMonth.map((item) => item.month);
  const areaSeries = [
    {
      name: 'Redações',
      data: essaysPerMonth.map((item) => item.count),
    },
  ];

  // Gráfico de Nota média por mês
  const avgNoteCategories = essaysAvgNote.map((item) => item.month);
  const avgNoteSeries = [
    {
      name: 'Nota Média',
      data: essaysAvgNote.map((item) => Number(item.avg.toFixed(2))),
    },
  ];

  // Gráfico de Plannings por mês
  const planningCategories = planningsPerMonth.map((item) => item.month);
  const planningSeries = [
    {
      name: 'Plannings',
      data: planningsPerMonth.map((item) => item.count),
    },
  ];

  // Gráfico Pizza - Temas
  const pieSeriesFormatted = essaysPerTheme.map((item) => ({
    label: item.theme,
    value: item.count,
  }));

  // Gráfico Pizza - Status
  const pieSeriesStatusFormatted = essaysPerStatus.map((item) => ({
    label: item.status,
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

        {/* Redações por mês */}
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

        {/* Nota média por mês */}
        <Grid xs={12} md={12} lg={12} mt={2}>
          <Card>
            <DashboardAreaVisualization
              sx={{ height: '500px' }}
              title="Nota média das redações por mês"
              chart={{
                categories: avgNoteCategories,
                series: avgNoteSeries,
              }}
            />
          </Card>
        </Grid>

        {/* Plannings por mês */}
        <Grid xs={12} md={12} lg={12} mt={2}>
          <Card>
            <DashboardAreaVisualization
              sx={{ height: '500px' }}
              title="Plannings por mês"
              chart={{
                categories: planningCategories,
                series: planningSeries,
              }}
            />
          </Card>
        </Grid>

        {/* Status das redações */}
        <Grid xs={12} md={12} lg={12} mt={2}>
          <DashboardDeviceVisualization
            title="Distribuição de redações por status"
            chart={{
              series: pieSeriesStatusFormatted,
            }}
          />
        </Grid>

        {/* Temas das redações */}
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
