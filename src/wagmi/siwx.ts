import bs58 from "bs58";
import { DefaultSIWX, EIP155Verifier, InformalMessenger, LocalStorage, SIWXVerifier } from "@reown/appkit-siwx";
import { CaipNetworkId, ConstantsUtil } from "@reown/appkit-common";
import { SIWXMessage, SIWXSession } from "@reown/appkit-controllers";
import { Verifier } from "bip322-js";
import * as nacl from "tweetnacl";

export type TPostAuthVerifyPayload = {
  chainId: CaipNetworkId;
  accountAddress: string;
  nonce: string;
  message: string;
  signature: string;
};

export class BIP122Verifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.BITCOIN;

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      // return Promise.resolve(Verifier.verifySignature(session.data.accountAddress, session.message, session.signature));

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

      return res.data.verified ? true : false;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Default verifier for Solana sessions.
 */
export class SolanaVerifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.SOLANA;

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      // const publicKey = bs58.decode(session.data.accountAddress);
      // const signature = bs58.decode(session.signature);
      // const message = new TextEncoder().encode(session.message.toString());

      // const isValid = nacl.sign.detached.verify(message, signature, publicKey);

      // return Promise.resolve(isValid);

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

      return res.data.verified ? true : false;
    } catch (error) {
      return Promise.resolve(false);
    }
  }
}

const DEFAULTS = {
  getDefaultMessenger: () =>
    new InformalMessenger({
      domain: typeof document === "undefined" ? "Unknown Domain" : document.location.host,
      uri: typeof document === "undefined" ? "Unknown URI" : document.location.href,
      getNonce: async (input: SIWXMessage.Input): Promise<string> => {
        const nonce = await fetch(`/api/auth/nonce?address=${input.accountAddress}`)
          .then((res) => res.json())
          .then((res) => res.data.nonce);
        return nonce;
      },
    }),

  getDefaultVerifiers: () => [new EIP155Verifier(), new SolanaVerifier()],

  getDefaultStorage: () => new LocalStorage({ key: "@appkit/siwx" }),
};

export const siwx = new DefaultSIWX({
  messenger: DEFAULTS.getDefaultMessenger(),
  verifiers: [new EIP155Verifier(), new SolanaVerifier()],
});
