import { PendingImageMetadata } from '../PendingImageCard/PendingImageCard.types';

export type Folder = {
  id: string;
  name: string;
  description?: string;
  imageCount?: number;
};

export type FolderImage = {
  id: string;
  url: string;
  title: string;
};

export type ApprovalDrawerProps = {
  open: boolean;
  imageId: string;
  imageUrl: string | null;
  imageTitle: string;
  metadata?: PendingImageMetadata;
  onClose: () => void;
  onSaveMetadata: (imageId: string, metadata: PendingImageMetadata) => void;
  onApprove: (imageId: string, folderId: string, metadata: PendingImageMetadata) => void;
  onAddToNew: (imageId: string, metadata: PendingImageMetadata) => void;
};

export type DrawerView = 'metadata' | 'folder-list' | 'folder-contents';
