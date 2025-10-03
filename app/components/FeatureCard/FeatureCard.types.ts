export interface FeatureCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: React.ReactNode;
  isExpanded: boolean;
  onClick: (id: string) => void;
}
