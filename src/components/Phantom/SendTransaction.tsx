import { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  TransactionInstruction,
  SendOptions,
} from "@solana/web3.js";
import { Token } from "@solana/spl-token";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signAndSendTransaction"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signAndSendTransaction: (
    transaction: Transaction,
    options?: SendOptions
  ) => Promise<{ signature: string }>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
};

const NETWORK = clusterApiUrl("mainnet-beta");
const CONNECTION = new Connection(NETWORK);
const EXTERNAL_ADDRESS = new PublicKey(
  "9St1VZtnsTQ8KLvjjySt4Ra5k2PX8HpoLCTau86t3imZ"
);

var provider = getProvider();

const createTransaction = async (instructions: TransactionInstruction[]) => {
  if (!provider.publicKey) {
    return;
  }
  let transaction = new Transaction().add(...instructions);
  transaction.feePayer = provider.publicKey;
  console.log("Getting recent blockhash");
  const anyTransaction: any = transaction;
  anyTransaction.recentBlockhash = (
    await CONNECTION.getRecentBlockhash()
  ).blockhash;
  return transaction;
};
const createTransferTransaction = async (price) =>
  createTransaction([
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: EXTERNAL_ADDRESS,
      lamports: (price * 1000000000),
    }),
  ]);
const sendTransaction = async (transaction: Transaction, callback) => {
  if (transaction) {
    try {
        let { signature } = await provider.signAndSendTransaction(transaction);
        console.log(
          "Submitted transaction " + signature + ", awaiting confirmation"
        );
        await CONNECTION.confirmTransaction(signature);
        callback(signature);
    } catch (err) {
      console.warn(err);
      console.log("Error: " + JSON.stringify(err));
    }
  }
};
const sendTransferInstruction = async (price, callback) => {
    if(provider == undefined) {
      provider = getProvider();
      const transaction = await createTransferTransaction(price);
      sendTransaction(transaction, callback);
    } else {
      const transaction = await createTransferTransaction(price);
      sendTransaction(transaction, callback);
    }
};


export default sendTransferInstruction
