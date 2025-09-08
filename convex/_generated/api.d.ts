/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminSetup from "../adminSetup.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as bbRealDataImport from "../bbRealDataImport.js";
import type * as bbSampleData from "../bbSampleData.js";
import type * as categories from "../categories.js";
import type * as cleanup from "../cleanup.js";
import type * as clearAllData from "../clearAllData.js";
import type * as clearAuthUsers from "../clearAuthUsers.js";
import type * as clearData from "../clearData.js";
import type * as createBBData from "../createBBData.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as importBBMasterListSetup from "../importBBMasterListSetup.js";
import type * as importMasterList from "../importMasterList.js";
import type * as importVendors from "../importVendors.js";
import type * as logs from "../logs.js";
import type * as mauc from "../mauc.js";
import type * as migrate from "../migrate.js";
import type * as products from "../products.js";
import type * as projects from "../projects.js";
import type * as quickSetup from "../quickSetup.js";
import type * as runMigration from "../runMigration.js";
import type * as sampleData from "../sampleData.js";
import type * as setupAdmin from "../setupAdmin.js";
import type * as units from "../units.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminSetup: typeof adminSetup;
  analytics: typeof analytics;
  auth: typeof auth;
  bbRealDataImport: typeof bbRealDataImport;
  bbSampleData: typeof bbSampleData;
  categories: typeof categories;
  cleanup: typeof cleanup;
  clearAllData: typeof clearAllData;
  clearAuthUsers: typeof clearAuthUsers;
  clearData: typeof clearData;
  createBBData: typeof createBBData;
  emails: typeof emails;
  files: typeof files;
  http: typeof http;
  importBBMasterListSetup: typeof importBBMasterListSetup;
  importMasterList: typeof importMasterList;
  importVendors: typeof importVendors;
  logs: typeof logs;
  mauc: typeof mauc;
  migrate: typeof migrate;
  products: typeof products;
  projects: typeof projects;
  quickSetup: typeof quickSetup;
  runMigration: typeof runMigration;
  sampleData: typeof sampleData;
  setupAdmin: typeof setupAdmin;
  units: typeof units;
  users: typeof users;
  vendors: typeof vendors;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          createdAt: number;
          errorMessage?: string;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject: string;
          text?: string;
          to: string;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
