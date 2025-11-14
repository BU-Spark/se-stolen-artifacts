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
  selectedFolderId?: string | null; // Persist selected folder across drawer opens/closes
  selectedFolderName?: string | null; // Persist selected folder name for immediate display
  onClose: () => void;
  onSaveMetadata: (imageId: string, metadata: PendingImageMetadata) => void;
  onApprove: (imageId: string, folderId: string, metadata: PendingImageMetadata) => void;
  onAddToNew: (imageId: string, metadata: PendingImageMetadata) => void;
  onFolderSelected?: (folderId: string | null, folderName?: string | null) => void; // null = new folder
};

export type DrawerView = 'metadata' | 'folder-list' | 'folder-contents';
