import cronstrue from "cronstrue";
import "cronstrue/locales/ko";

/**
 * 크론 스케줄에서 순수 크론 식 추출
 *
 * @param schedule - OpenClaw에서 가져온 스케줄 문자열
 * @returns 순수 크론 식 (예: "0 9 * * *")
 *
 * @example
 * extractCronExpression('0 9 * * * @ Asia/Seoul (expr: "0 9 * * *")')
 * // Returns: "0 9 * * *"
 */
export function extractCronExpression(schedule: string): string {
  // "0 9 * * * @ Asia/Seoul (expr: "0 9 * * *")" -> "0 9 * * *"
  const exprMatch = schedule.match(/expr:\s*"([^"]+)"/);
  if (exprMatch) return exprMatch[1];

  // expr이 없으면 @ 앞부분 사용
  const atIndex = schedule.indexOf("@");
  if (atIndex > 0) return schedule.substring(0, atIndex).trim();

  return schedule.trim();
}

/**
 * 크론 식을 한국어로 변환
 *
 * @param cronExpression - 크론 식 또는 스케줄 문자열
 * @returns 한국어 자연어 표현
 *
 * @example
 * cronToHumanReadable('0 9 * * *')
 * // Returns: "매일 오전 09:00"
 */
export function cronToHumanReadable(cronExpression: string): string {
  try {
    const pureCron = extractCronExpression(cronExpression);
    return cronstrue.toString(pureCron, { locale: "ko" });
  } catch {
    // 파싱 실패 시 원본 반환
    return cronExpression;
  }
}
