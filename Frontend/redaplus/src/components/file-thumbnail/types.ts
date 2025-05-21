// ----------------------------------------------------------------------

import { ContentWithMetadataId } from '../../types/content';

export interface ExtendFile extends File, ContentWithMetadataId {
  preview?: string;
  path: string;
  lastModifiedDate?: string;
  video_id?: string;
}
