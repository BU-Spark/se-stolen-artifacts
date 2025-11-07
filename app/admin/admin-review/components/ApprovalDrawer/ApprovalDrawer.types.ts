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
  onClose: () => void;
  onApprove: (imageId: string, folderId: string) => void;
  onAddToNew: (imageId: string) => void;
};

export type DrawerView = 'folder-list' | 'folder-contents';
