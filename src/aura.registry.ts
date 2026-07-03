import "server-only";

import "@/aura/server/auth/operations";
import "@/features/admin/index";
import "@/features/catalog/index";
import "@/features/tracking/index";
import "@/features/blog/index";
import "@/features/site/index";
import "@/features/notifications/index";
import "@/features/requests/index";
import "@/features/journeys/index";

export {
  getClientOperationManifest,
  getOperation,
  listOperations,
} from "@/aura/server/registry";
