import { NextRequest } from 'next/server';
import { runQualificationAgent } from '@/lib/agents/qualification';
import { runScoringAgent } from '@/lib/agents/scoring';
import { runProspectionAgent } from '@/lib/agents/prospection';
import type { SectorId } from '@/lib/sectors';

export async function POST(request: NextRequest) {
  const body = await request.json() as { listing?: string; sector?: SectorId };
  const listing = body.listing?.trim();
  const sector: SectorId = 'credit';

  if (!listing || listing.length < 20) {
    return new Response(
      JSON.stringify({ error: 'Message trop court.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const qualification = await runQualificationAgent(listing, sector);
        send({ step: 'qualification', data: qualification });

        const scoring = await runScoringAgent(qualification, sector);
        send({ step: 'scoring', data: scoring });

        const prospection = await runProspectionAgent(qualification, scoring, sector);
        send({ step: 'prospection', data: prospection });

        send({ step: 'done' });
      } catch (err) {
        send({ step: 'error', message: err instanceof Error ? err.message : 'Erreur interne' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
