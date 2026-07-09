"use client";

import { useRouter } from "@workspace/i18n/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace");
  }, [router]);

  return null;
}
