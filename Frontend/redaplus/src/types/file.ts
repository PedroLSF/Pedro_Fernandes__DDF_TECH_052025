export type FileWithMetadataId = File & {
  id: string;
  metadata?: Record<string, any>;
  path?: string;
  preview?: string | null;
};
