"use client";

import { Panel } from "@workspace/core/components/panel/panel";
import { AccountPanel } from "@workspace/core/components/panels/account-panel";
import { BillingPanel } from "@workspace/core/components/panels/billing-panel";
import { UpgradePanel } from "@workspace/core/components/panels/upgrade-panel";
import { usePanelStore } from "@workspace/core/stores/panel-store";

export function PanelManager() {
  const { activePanel, closePanel } = usePanelStore();

  const getPanelContent = () => {
    switch (activePanel) {
      case "upgrade":
        return {
          title: "Upgrade to Hyperion Pro",
          content: <UpgradePanel />,
        };
      case "account":
        return {
          title: "Account Settings",
          content: <AccountPanel />,
        };
      case "billing":
        return {
          title: "Billing Dashboard",
          content: <BillingPanel />,
        };
      default:
        return {
          title: "",
          content: null,
        };
    }
  };

  const { title, content } = getPanelContent();

  return (
    <Panel isOpen={activePanel !== null} onClose={closePanel} title={title}>
      {content}
    </Panel>
  );
}
