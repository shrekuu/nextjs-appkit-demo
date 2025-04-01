import { CaipNetworkId } from '@reown/appkit';
import { create } from "zustand";

export type TSessionData = {
  address: string;
  authenticated: boolean;
  tempNonce: string;
  tempAddress: string;

  chainId?: CaipNetworkId,
  accountAddress?: string,
};

export const defaultSession: TSessionData = {
  address: "",
  authenticated: false,
  tempNonce: "",
  tempAddress: "",
};

export const useSessionStore = create<TSessionData>(() => ({ ...defaultSession }));
