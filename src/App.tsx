import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useEffect, useState } from "react";
import {
  TariPermissions,
  WalletDaemonParameters,
  WalletDaemonTariProvider,
} from "./provider";
import {
  TariPermissionAccountInfo,
  TariPermissionKeyList,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
} from "./provider/permissions";
import { Typography } from "@mui/material";
import { Tapplet } from "./components/Tapplet";
import { Installer } from "./components/Installer";

let permissions = new TariPermissions();
permissions.addPermission(new TariPermissionKeyList());
permissions.addPermission(new TariPermissionAccountInfo());
permissions.addPermission(new TariPermissionTransactionSend());
permissions.addPermission(new TariPermissionSubstatesRead());
let optionalPermissions = new TariPermissions();
const params: WalletDaemonParameters = {
  permissions,
  optionalPermissions,
};
const provider = await WalletDaemonTariProvider.build(params);

const INSTALLED_TAPPLET_ID = 1;
function App() {
  const [balances, setBalances] = useState({});

  async function get_free_coins() {
    await invoke("get_free_coins", {});
  }

  async function get_balances() {
    setBalances(await invoke("get_balances", {}));
  }

  useEffect(() => {
    const handleMessage = async (event: any) => {
      const { methodName, args } = event.data;
      const result = await provider.runOne(methodName, args);
      event.source.postMessage({ id: event.id, result }, event.origin);
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="container">
      <h1>Tauri wallet daemon</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          get_free_coins();
        }}
      >
        <button type="submit">Get free coins</button>
      </form>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          get_balances();
        }}
      >
        <button type="submit">Get balances</button>
      </form>
      <Typography textAlign="center">
        balances: {JSON.stringify(balances)}
      </Typography>

      <Installer installedTappletId={INSTALLED_TAPPLET_ID} />
      <Tapplet installedTappletId={INSTALLED_TAPPLET_ID} />
    </div>
  );
}

export default App;
