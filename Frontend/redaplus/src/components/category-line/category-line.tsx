import { Box } from '@mui/material';

import Label from '../label';

export type Props = {
  categories: string[];
};

export default function CategoryLine({ categories }: Props) {
  return (
    <>
      {categories.map((category, index) => (
        <Box key={`${category}-${index}`} sx={{ borderRight: '1px solid gray' }}>
          <Label variant="soft" color="default" sx={{ mr: 1 }}>
            {category}
          </Label>
        </Box>
      ))}
    </>
  );
}
