// Define the valid path IDs as a type
export type PathId = "classic" | "smart" | "culture" | "focused";

export type Path = {
  id: number;
  learning_path_id: PathId;
  title: string;
  subtitle: string;
  difficulty: number;
  progress: number;
  icon: string;
  meta:
    | { icon: string; text: string }[]
    | { icon: React.ReactNode; text: string }[];
  badges: { text: string; variant: string }[];
  xpText: string;
  buttonText: string;
};

export type PathCardProps = {
  path: Path;
  onSelect: (pathId: number) => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
};
