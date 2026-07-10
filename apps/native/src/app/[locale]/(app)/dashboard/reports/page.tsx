"use client";

import { useRouter } from "@workspace/i18n/navigation";
import { useEffect } from "react";

export default function ReportsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace");
  }, [router]);

  return null;
}
