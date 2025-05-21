import React, { useState } from 'react';

import { Menu, Button, MenuItem } from '@mui/material';

import Iconify from 'src/components/iconify';

type ContentDownloadButtonProps = {
  onDownload?: (resolution?: string | null) => void;
  resolutions?: null | string[];
};

export default function ContentDownloadButton({
  onDownload,
  resolutions,
}: ContentDownloadButtonProps) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadOption = (value: string | null) => {
    onDownload?.(value);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#212B36',
          color: 'white',
          ':hover': { backgroundColor: '#354557' },
        }}
        startIcon={<Iconify icon="mingcute:download-3-fill" />}
        endIcon={<Iconify icon="mi:caret-down" />}
        onClick={handleClick}
        data-cy="video-download-button"
      >
        Download
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleDownloadOption(null)}>Original</MenuItem>
        {resolutions?.map?.((resolution) => (
          <MenuItem key={resolution} onClick={() => handleDownloadOption(resolution)}>
            {resolution}
          </MenuItem>
        )) ?? null}
      </Menu>
    </>
  );
}
