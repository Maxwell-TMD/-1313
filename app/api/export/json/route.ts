import { createBackupPayload } from "@/lib/backup";

export async function GET() {
  const payload = await createBackupPayload();
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gongkao-backup-${payload.exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
