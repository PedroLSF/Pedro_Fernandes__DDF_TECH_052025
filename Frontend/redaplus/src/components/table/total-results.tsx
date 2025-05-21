import React from 'react';

import { Box } from '@mui/material';

type Props = { 
  results: number;
  isLoading?: boolean;
};

export default function TotalElementsOnTable({ results, isLoading = false }: Props) {
  return (
    <Box sx={{ typography: 'body2', p: 2.5, pt: 0 }}>
      <strong>{isLoading ? '-' : results}</strong>
      <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
        {' '}
        resultados no total
      </Box>
    </Box>
  );
}
