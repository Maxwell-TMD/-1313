export const EXAM_TYPES = ["国考", "省考", "事业单位", "其他"] as const;
export const SUBJECTS = ["行测", "申论"] as const;

export type ExamType = (typeof EXAM_TYPES)[number];
export type Subject = (typeof SUBJECTS)[number];
