export function calculateAccuracy(correct: number, total: number) {
  if (total <= 0) return null;
  return (correct / total) * 100;
}

export function formatAccuracy(value: number | null) {
  return value === null ? "暂无数据" : `${value.toFixed(1)}%`;
}
