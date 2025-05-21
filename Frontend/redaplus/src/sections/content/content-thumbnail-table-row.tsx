import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { IContentItem } from 'src/types/content';

// ----------------------------------------------------------------------

type FileIconProps = {
  item: IContentItem;
};

export default function ContentThumbnailTableRow({ item }: FileIconProps) {
  const videoUrl = item?.thumb?.image_url
    ? item?.thumb?.image_url
    : '/assets/images/videos/placeholder-video.png';

  const renderContent = (
    <Stack
      sx={{
        borderRadius: 1,
        position: 'relative',
        width: '150px',
        paddingBottom: '56.25%',
        backgroundColor: '#ccc',
      }}
    >
      <Box
        component="img"
        src={videoUrl}
        sx={{
          borderRadius: 1,
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Stack>
  );

  return <>{renderContent}</>;
}
