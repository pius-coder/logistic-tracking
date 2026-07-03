import "server-only";

import { s3Driver } from "./s3";
import { cloudinaryDriver } from "./cloudinary";
import type { AuraStorageDriver, AuraStorage } from "./types";

const drivers = new Map<string, AuraStorageDriver>();

drivers.set(s3Driver.name, s3Driver);
drivers.set(cloudinaryDriver.name, cloudinaryDriver);

export function registerStorageDriver(driver: AuraStorageDriver): void {
  drivers.set(driver.name, driver);
}

export async function getStorageDriver(name?: string): Promise<AuraStorageDriver> {
  const driverName = name || process.env.AURA_STORAGE_DRIVER || "filesystem";
  let driver = drivers.get(driverName);
  if (!driver) {
    if (driverName === "filesystem") {
      const { filesystemDriver } = await import("./filesystem");
      registerStorageDriver(filesystemDriver);
      driver = filesystemDriver;
    } else {
      throw new Error(`[aura] Storage driver not found: ${driverName}`);
    }
  }
  return driver;
}

export async function createAuraStorage(): Promise<AuraStorage> {
  const driver = await getStorageDriver();

  return {
    async upload(args) {
      return driver.upload(args);
    },
    async delete(keyOrUrl) {
      return driver.delete(keyOrUrl);
    },
  };
}
