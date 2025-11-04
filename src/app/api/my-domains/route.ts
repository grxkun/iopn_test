import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi } from '@/lib/contracts';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'invalid address' }, { status: 400 });
    }

    const registrarAbi = await getRegistrarAbi();
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.iopn.tech');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contract = new ethers.Contract(REGISTRAR_ADDRESS, registrarAbi as any, provider);

    // Get Transfer events where to == address and from == zero
    // Query in smaller chunks to avoid the 10k block limit
    const currentBlock = await provider.getBlockNumber();
    const chunkSize = 5000; // Smaller chunks for reliability
    const zeroAddress = ethers.ZeroAddress;
    const filter = contract.filters.Transfer(zeroAddress, address);

    const allEvents: any[] = [];
    // Query last 50k blocks in 5k block chunks
    const maxBlocksBack = 50000;
    const startBlock = Math.max(0, currentBlock - maxBlocksBack);

    for (let blockStart = startBlock; blockStart <= currentBlock; blockStart += chunkSize) {
      const blockEnd = Math.min(currentBlock, blockStart + chunkSize - 1);
      try {
        const events = await contract.queryFilter(filter, blockStart, blockEnd);
        allEvents.push(...events);
      } catch (error) {
        // Log but continue with other chunks
        console.warn(`Failed to query blocks ${blockStart}-${blockEnd}:`, error instanceof Error ? error.message : String(error));
      }
    }

    const domains = [];
    for (const event of allEvents) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenId = (event as any).args[2]; // Transfer(from, to, tokenId)
      try {
        const name = await contract.tokenIdToName(tokenId);
        domains.push({
          name,
          tokenId: tokenId.toString()
        });
      } catch (error) {
        // Skip if name not found
        console.warn(`Could not get name for tokenId ${tokenId}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return NextResponse.json({ domains });
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}