import { type CaipNetworkId, ConstantsUtil, SafeLocalStorage, type SafeLocalStorageItems, SafeLocalStorageKeys } from "@reown/appkit-common";
import { AccountController, ApiController, BlockchainApiController, ChainController, type SIWXConfig, type SIWXMessage, type SIWXSession } from "@reown/appkit-controllers";
import { ConstantsUtil as AppKitConstantUtil } from "@reown/appkit-utils";

import { InformalMessenger, SIWXMessenger } from "@reown/appkit-siwx";

export type TPostAuthVerifyPayload = {
  chainId: CaipNetworkId;
  accountAddress: string;
  nonce: string;
  message: string;
  signature: string;
};

/**
 * This is the configuration for using SIWX with Cloud Auth service.
 * It allows you to authenticate and capture user sessions through the Cloud Dashboard.
 *
 */
export class AppSIWX implements SIWXConfig {
  private readonly localAuthStorageKey: keyof SafeLocalStorageItems;
  private readonly localNonceStorageKey: keyof SafeLocalStorageItems;
  private readonly messenger: SIWXMessenger;

  private required: boolean;

  constructor() {
    this.localAuthStorageKey = SafeLocalStorageKeys.SIWX_AUTH_TOKEN;
    this.localNonceStorageKey = SafeLocalStorageKeys.SIWX_NONCE_TOKEN;
    this.required = true;

    this.messenger = new InformalMessenger({
      domain: typeof document === "undefined" ? "Unknown Domain" : document.location.host,
      uri: typeof document === "undefined" ? "Unknown URI" : document.location.href,
      getNonce: this.getNonce.bind(this),
      clearChainIdNamespace: false,
    });
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input);
  }

  async addSession(session: SIWXSession): Promise<void> {
    console.log("addSession", session);

    const payload: TPostAuthVerifyPayload = {
      chainId: session.data.chainId,
      accountAddress: session.data.accountAddress,
      nonce: session.data.nonce,
      message: session.message,
      signature: session.signature,
    };

    const res = await fetch(`/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => res.json());

    if (res.data.verified) {
      console.log('ddd', this.localAuthStorageKey)
      this.setStorageToken(res.token, this.localAuthStorageKey);
    }
  }

  async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {

    console.log('getSession', chainId, address);

    try {
      const siwxSession: {
        chainId: CaipNetworkId;
        address: string;
      } = await fetch("/api/auth/session").then((res) => res.json());

      console.log('getSession', siwxSession);

      const isSameAddress = siwxSession?.address.toLowerCase() === address.toLowerCase();
      const isSameNetwork = siwxSession?.chainId === chainId;

      if (!isSameAddress || !isSameNetwork) {
        return [];
      }

      const session: SIWXSession = {
        data: {
          accountAddress: siwxSession.address,
          chainId: siwxSession?.chainId,
        } as SIWXMessage.Data,
        message: "",
        signature: "",
      };

      console.log('getsession after fresh session', session);

      return [session];
    } catch {
      return [];
    }
  }

  async revokeSession(_chainId: CaipNetworkId, _address: string): Promise<void> {
    return Promise.resolve(this.clearStorageTokens());
  }

  async setSessions(sessions: SIWXSession[]): Promise<void> {
    if (sessions.length === 0) {
      this.clearStorageTokens();
    } else {
      const session = (sessions.find((s) => s.data.chainId === ChainController.getActiveCaipNetwork()?.caipNetworkId) || sessions[0]) as SIWXSession;

      await this.addSession(session);
    }
  }

  getRequired() {
    return this.required;
  }

  private getStorageToken(key: keyof SafeLocalStorageItems): string | undefined {
    return SafeLocalStorage.getItem(key);
  }

  private setStorageToken(token: string, key: keyof SafeLocalStorageItems): void {
    SafeLocalStorage.setItem(key, token);
  }

  private clearStorageTokens(): void {
    SafeLocalStorage.removeItem(this.localAuthStorageKey);
  }

  private async getNonce(input: SIWXMessage.Input): Promise<string> {
    const nonce = await fetch(`/api/auth/nonce?address=${input.accountAddress}`)
      .then((res) => res.json())
      .then((res) => res.data.nonce);

    return nonce;
  }
}
