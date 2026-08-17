import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import PwaInstallButton from "../components/PwaInstallButton";
import { getToken } from "../api";
import { beginLogin, isOidcConfigured } from "../auth/oidc";
import { premiumMarkup } from "../landing/premiumMarkup";
import { mountPremiumLanding } from "../landing/premiumInteractions";
import "../landing/premium.css";

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pwaSlot, setPwaSlot] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return mountPremiumLanding({
      root,
      onPwaSlot: setPwaSlot,
      onPrivateAccess: async () => {
        const authenticated = Boolean(getToken());
        const oidcConfigured = isOidcConfigured();

        if (authenticated || !oidcConfigured) {
          navigate("/app");
          return;
        }

        await beginLogin("/app");
      },
    });
  }, [navigate]);

  return (
    <>
      <div
        ref={rootRef}
        className="patroai-premium"
        // The HTML is immutable source-controlled Wave 1 content.
        // No user input is interpolated into this string.
        dangerouslySetInnerHTML={{ __html: premiumMarkup }}
      />
      {pwaSlot
        ? createPortal(<PwaInstallButton compact />, pwaSlot)
        : null}
    </>
  );
}
