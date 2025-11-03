// ABIs are loaded from public directory at runtime
export const REGISTRAR_ABI = [] as const; // Will be loaded dynamically
export const RESOLVER_ABI = [] as const; // Will be loaded dynamically

// Read addresses from env (set these after deployment). Frontend uses NEXT_PUBLIC_*
export const REGISTRAR_ADDRESS = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS || '';
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
