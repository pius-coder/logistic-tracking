import "server-only";

import "@/aura/server/auth/operations";
import "@/features/notifications/server/whatsapp";
import "@/features/notifications/server/operations";
import "@/features/admin/index";
import "@/features/tracking/index";
import "@/features/blog/index";
import "@/features/user/index";

export {
  getClientOperationManifest,
  getOperation,
  listOperations,
} from "@/aura/server/registry";
