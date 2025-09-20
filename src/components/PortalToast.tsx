import { Box, chakra } from "@chakra-ui/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type ToastStatus = "error" | "success" | "info" | "warning";

export type PortalToastProps = {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number; // ms
  onClose?: () => void;
};

const statusBg: Record<ToastStatus, string> = {
  error: "red.500",
  success: "green.500",
  info: "blue.500",
  warning: "yellow.500",
};

export function PortalToast({
  title,
  description,
  status = "error",
  duration = 2500,
  onClose,
}: PortalToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const id = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);

  return createPortal(
    <Box
      position="fixed"
      top="16px"
      right="16px"
      bg={statusBg[status]}
      color="white"
      px={4}
      py={3}
      borderRadius="md"
      boxShadow="lg"
      zIndex={1000}
      role={status === "error" || status === "warning" ? "alert" : "status"}
      aria-live={status === "error" || status === "warning" ? "assertive" : "polite"}
    >
      <chakra.div fontWeight="bold">{title}</chakra.div>
      {description && <chakra.div fontSize="sm">{description}</chakra.div>}
    </Box>,
    document.body
  );
}
