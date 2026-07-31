export type StatsRecord = {
  date: string;
  totalQuestions: number;
  correctQuestions: number;
  durationMinutes: number;
  primaryCategory: { id: string; name: string };
  secondaryCategory: { id: string; name: string } | null;
};

export type CategoryStat = {
  id: string;
  name: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number | null;
};
