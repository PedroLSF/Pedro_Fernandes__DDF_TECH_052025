export type IDashboardOrderFilterValue = string | Date | null;

export type IDashboardOrderFilters = {
  startDate: Date | null;
  endDate: Date | null;
  timezone: String | null;
};

export type IDashboardFilterValue = string | string[] | Date | null;
