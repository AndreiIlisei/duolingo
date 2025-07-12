// Define the valid path IDs as a type
export type PathId = "classic" | "srs" | "immersion" | "targeted";

export type Path = {
  id: number;
  courseId: number | null;
  order: number | null;
  title: string;
  description: string;
  learning_path_type: PathId;
  // type: PathId;
  // subtitle: string;
  // difficulty: number;
  // progress: number;
  // icon: string;
  // meta:
  //   | { icon: string; text: string }[]
  //   | { icon: React.ReactNode; text: string }[];
  // badges: { text: string; variant: string }[];
  // xpText: string;
  // buttonText: string;
};

export type PathCardProps = {
  path: Path;
  onSelect: (pathId: number) => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
};
