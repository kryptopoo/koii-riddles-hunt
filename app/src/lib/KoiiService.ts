import { Connection, PublicKey } from "@_koi/web3.js";
import axios from "axios";

const KOII_RPC_URL = import.meta.env.VITE_RPC_URL;

export default class KoiiService {
  public static async connectWallet() {
    let walletAddress = undefined;
    const k2: any = (window as any).k2;
    if (k2) {
      await k2.connect();
      walletAddress = k2.publicKey.toString();
      console.log("walletAddress", walletAddress);
    }
    return walletAddress;
  }

  public static async getTaskState(taskId: string) {
    let taskState = undefined;

    const connection = new Connection(KOII_RPC_URL);
    const accountInfo: any = await connection.getAccountInfo(
      new PublicKey(taskId)
    );

    if (accountInfo) {
      taskState = JSON.parse(accountInfo.data);
      console.log("taskState", taskState);
    }

    return taskState;
  }

  public static async getEpochInfo() {
    const response = await axios({
      method: "post",
      url: KOII_RPC_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        method: "getEpochInfo",
        jsonrpc: "2.0",
        params: [],
        id: "",
      }),
    });

    console.log(JSON.stringify(response.data));
    return response.data.result;
  }
}
