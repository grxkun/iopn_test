// ABIs are loaded from public directory at runtime
export const REGISTRAR_ABI = [] as const; // Will be loaded dynamically
export const RESOLVER_ABI = [] as const; // Will be loaded dynamically

// Read addresses from env (set these after deployment). Frontend uses NEXT_PUBLIC_*
// Use NEXT_PUBLIC_* env var when available (preferred). If not present (e.g. Vercel envs
// not configured), fall back to the last deployed registrar address so the dashboard
// continues to work.
export const REGISTRAR_ADDRESS = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS || '0x80F58D856432eFB0C0c58468FB2a2a3397fF2da7';
export const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_RESOLVER_ADDRESS || '';

// Helper functions to load ABIs dynamically
export async function getRegistrarAbi() {
  const response = await fetch('/IOPNRegistrar.abi.json');
  return response.json();
}

export async function getResolverAbi() {
  const response = await fetch('/IOPNResolver.abi.json');
  return response.json();
}
