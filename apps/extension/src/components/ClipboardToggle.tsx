import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStorageData, setStorageData } from "@/lib/storage";

export function ClipboardToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getStorageData().then((storage) => {
      setEnabled(storage.clipboardSyncEnabled ?? false);
    });
  }, []);

  const handleToggle = async () => {
    const newValue = !enabled;
    await setStorageData({ clipboardSyncEnabled: newValue });
    setEnabled(newValue);

    chrome.runtime.sendMessage({
      type: "clipboardSyncChanged",
      enabled: newValue,
    });
  };

  return (
    <Button
      variant={enabled ? "default" : "ghost"}
      size="icon"
      onClick={handleToggle}
      className="h-8 w-8"
      title={enabled ? "Clipboard Sync Enabled" : "Clipboard Sync Disabled"}
    >
      {enabled ? (
        <ClipboardCheck className="h-4 w-4" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
    </Button>
  );
}

