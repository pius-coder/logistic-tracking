import "server-only";

import "@/aura/server/auth/operations";
import "@/features/notifications/server/operations";
import "@/features/admin/index";
import "@/features/tracking/index";
import "@/features/journeys/index";
import "@/features/blog/index";
import "@/features/requests/index";

export {
  getClientOperationManifest,
  getOperation,
  listOperations,
} from "@/aura/server/registry";
