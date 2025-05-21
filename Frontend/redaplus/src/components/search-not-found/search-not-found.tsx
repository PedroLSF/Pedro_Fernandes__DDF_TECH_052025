import Typography from '@mui/material/Typography';
import Paper, { PaperProps } from '@mui/material/Paper';

// ----------------------------------------------------------------------

interface Props extends PaperProps {
  query?: string;
}

export default function SearchNotFound({ query, sx, ...other }: Props) {
  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        Não encontrado
      </Typography>

      <Typography variant="body2">
        Nenhum resultado encontrado para: &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> Tente uma busca diferente.
      </Typography>
    </Paper>
  ) : (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        Por favor, digite uma busca.
      </Typography>
    </Paper>
  );
}
