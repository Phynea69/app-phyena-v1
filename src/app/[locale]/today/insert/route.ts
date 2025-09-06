import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { locale: string } }) {
  // Stub neutre pour satisfaire le typage et la route
  return NextResponse.json({ ok: true });
}
