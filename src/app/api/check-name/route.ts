import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    // In production (Vercel), do not attempt to spawn Python
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        name,
        is_valid: /^[a-z0-9]{3,32}$/.test(name.trim().toLowerCase()),
        reason: 'runtime-fallback',
        available: null,
      });
    }

    const pyPath = process.env.PYTHON_BIN || '/workspaces/iopn_test/.venv/bin/python';
    const scriptPath = 'scripts/check_name.py';

    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn(pyPath, [scriptPath, name], { cwd: process.cwd() });
      let data = '';
      let err = '';
      child.stdout.on('data', (chunk) => (data += chunk.toString()));
      child.stderr.on('data', (chunk) => (err += chunk.toString()));
      child.on('close', (code) => {
        if (code === 0 || data) resolve(data);
        else reject(new Error(err || `python exited with code ${code}`));
      });
      child.on('error', (e) => reject(e));
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(output);
    } catch {
      return NextResponse.json({ error: 'invalid python output', raw: output }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}
