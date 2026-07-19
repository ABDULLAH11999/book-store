import { Prisma, PrismaClient } from "@prisma/client";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type DecimalBackup = {
  s: number;
  e: number;
  d: number[];
};

type PublicBackupFile = {
  path: string;
  size: number;
  mimeType: string;
  encoding: "base64";
  content: string;
};

type BackupPayload = {
  exportedAt: string;
  version: string;
  tables: {
    customers?: Array<Record<string, unknown>>;
    products?: Array<Record<string, unknown>>;
    orders?: Array<Record<string, unknown>>;
    visitorSessions?: Array<Record<string, unknown>>;
    testimonials?: Array<Record<string, unknown>>;
    siteSettings?: Array<Record<string, unknown>>;
    emailLogs?: Array<Record<string, unknown>>;
    adminUsers?: Array<Record<string, unknown>>;
    sequences?: Array<Record<string, unknown>>;
  };
  publicAssets?: {
    baseDir?: string;
    files?: PublicBackupFile[];
  };
};

function isDecimalBackup(value: unknown): value is DecimalBackup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as DecimalBackup;
  return typeof candidate.s === "number" && typeof candidate.e === "number" && Array.isArray(candidate.d);
}

function decimalBackupToString(value: DecimalBackup) {
  const digits = value.d.map((part, index) => (index === 0 ? String(part) : String(part).padStart(7, "0"))).join("");
  const decimalIndex = value.e + 1;
  let result = digits;

  if (decimalIndex <= 0) {
    result = `0.${"0".repeat(Math.abs(decimalIndex))}${digits}`;
  } else if (decimalIndex < digits.length) {
    result = `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
  } else if (decimalIndex > digits.length) {
    result = `${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  result = result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return value.s < 0 ? `-${result}` : result;
}

function toDecimal(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return new Prisma.Decimal(value);
  }
  if (isDecimalBackup(value)) {
    return new Prisma.Decimal(decimalBackupToString(value));
  }
  throw new Error(`Unsupported decimal value: ${JSON.stringify(value)}`);
}

function toDate(value: unknown) {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  throw new Error(`Unsupported date value: ${JSON.stringify(value)}`);
}

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function usage() {
  console.log("Usage: npm run restore:backup -- <backup-json-path> [--restore-public]");
}

async function restorePublicAssets(files: PublicBackupFile[]) {
  const publicDir = path.join(process.cwd(), "public");

  for (const file of files) {
    const targetPath = path.join(publicDir, file.path);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, Buffer.from(file.content, "base64"));
  }

  console.log(`Restored ${files.length} public asset files into ${publicDir}`);
}

async function main() {
  const args = process.argv.slice(2);
  const restorePublic = args.includes("--restore-public");
  const backupPathArg = args.find((arg) => !arg.startsWith("--")) || process.env.BACKUP_FILE;

  if (!backupPathArg) {
    usage();
    throw new Error("Backup file path is required.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const backupPath = path.resolve(backupPathArg);
  const raw = await readFile(backupPath, "utf8");
  const backup = JSON.parse(raw) as BackupPayload;
  const prisma = new PrismaClient();

  try {
    console.log(`Restoring backup exported at ${backup.exportedAt} from ${backupPath}`);

    await prisma.$transaction([
      prisma.order.deleteMany(),
      prisma.customer.deleteMany(),
      prisma.product.deleteMany(),
      prisma.testimonial.deleteMany(),
      prisma.siteSettings.deleteMany(),
      prisma.emailLog.deleteMany(),
      prisma.adminUser.deleteMany(),
      prisma.sequence.deleteMany(),
      prisma.visitorSession.deleteMany()
    ]);

    const sequences = (backup.tables.sequences || []).map((row) => ({
      id: Number(row.id),
      lastNumber: Number(row.lastNumber),
      updatedAt: toDate(row.updatedAt) ?? undefined
    }));

    const adminUsers = (backup.tables.adminUsers || []).map((row) => ({
      id: String(row.id),
      email: String(row.email),
      passwordHash: String(row.passwordHash),
      role: row.role as any,
      createdAt: toDate(row.createdAt) ?? undefined,
      updatedAt: toDate(row.updatedAt) ?? undefined
    }));

    const siteSettings = (backup.tables.siteSettings || []).map((row) => ({
      id: String(row.id),
      key: String(row.key),
      value: String(row.value)
    }));

    const testimonials = (backup.tables.testimonials || []).map((row) => ({
      id: String(row.id),
      customerName: String(row.customerName),
      customerImage: String(row.customerImage),
      rating: Number(row.rating),
      reviewText: String(row.reviewText),
      status: row.status as any,
      sortOrder: Number(row.sortOrder),
      createdAt: toDate(row.createdAt) ?? undefined,
      updatedAt: toDate(row.updatedAt) ?? undefined
    }));

    const visitorSessions = (backup.tables.visitorSessions || []).map((row) => ({
      id: String(row.id),
      sessionId: String(row.sessionId),
      entryUrl: String(row.entryUrl),
      entryPath: String(row.entryPath),
      entryDomain: String(row.entryDomain),
      referrer: row.referrer == null ? null : String(row.referrer),
      platform: row.platform as any,
      ipAddress: row.ipAddress == null ? null : String(row.ipAddress),
      countryCode: row.countryCode == null ? null : String(row.countryCode),
      countryName: row.countryName == null ? null : String(row.countryName),
      state: row.state == null ? null : String(row.state),
      city: row.city == null ? null : String(row.city),
      userAgent: row.userAgent == null ? null : String(row.userAgent),
      pageViews: Number(row.pageViews),
      createdAt: toDate(row.createdAt) ?? undefined,
      lastSeenAt: toDate(row.lastSeenAt) ?? undefined
    }));

    const products = (backup.tables.products || []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      brand: String(row.brand),
      description: String(row.description),
      price: toDecimal(row.price),
      salePrice: row.salePrice == null ? null : toDecimal(row.salePrice),
      saleEndsAt: toDate(row.saleEndsAt),
      images: toJson(row.images ?? []),
      videoUrl: row.videoUrl == null ? null : String(row.videoUrl),
      stock: Number(row.stock),
      status: row.status as any,
      createdAt: toDate(row.createdAt) ?? undefined,
      updatedAt: toDate(row.updatedAt) ?? undefined
    }));

    const customers = (backup.tables.customers || []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      phone: String(row.phone),
      email: row.email == null ? null : String(row.email),
      address: String(row.address),
      city: String(row.city),
      createdAt: toDate(row.createdAt) ?? undefined
    }));

    const orders = (backup.tables.orders || []).map((row) => ({
      id: String(row.id),
      orderNumber: String(row.orderNumber),
      customerId: String(row.customerId),
      customerPhone: String(row.customerPhone),
      items: toJson(row.items ?? []),
      subtotal: toDecimal(row.subtotal),
      total: toDecimal(row.total),
      status: row.status as any,
      notes: row.notes == null ? null : String(row.notes),
      createdAt: toDate(row.createdAt) ?? undefined,
      updatedAt: toDate(row.updatedAt) ?? undefined
    }));

    const emailLogs = (backup.tables.emailLogs || []).map((row) => ({
      id: String(row.id),
      toEmail: String(row.toEmail),
      subject: String(row.subject),
      template: String(row.template),
      status: row.status as any,
      sentAt: toDate(row.sentAt) ?? undefined
    }));

    if (sequences.length) await prisma.sequence.createMany({ data: sequences });
    if (adminUsers.length) await prisma.adminUser.createMany({ data: adminUsers });
    if (siteSettings.length) await prisma.siteSettings.createMany({ data: siteSettings });
    if (testimonials.length) await prisma.testimonial.createMany({ data: testimonials });
    if (visitorSessions.length) await prisma.visitorSession.createMany({ data: visitorSessions });
    if (products.length) await prisma.product.createMany({ data: products });
    if (customers.length) await prisma.customer.createMany({ data: customers });
    if (orders.length) await prisma.order.createMany({ data: orders });
    if (emailLogs.length) await prisma.emailLog.createMany({ data: emailLogs });

    if (restorePublic && backup.publicAssets?.files?.length) {
      await restorePublicAssets(backup.publicAssets.files);
    }

    console.log("Restore complete.");
    console.log(
      JSON.stringify(
        {
          customers: customers.length,
          products: products.length,
          orders: orders.length,
          visitorSessions: visitorSessions.length,
          testimonials: testimonials.length,
          siteSettings: siteSettings.length,
          emailLogs: emailLogs.length,
          adminUsers: adminUsers.length,
          sequences: sequences.length
        },
        null,
        2
      )
    );

    if (!("visitorSessions" in backup.tables)) {
      console.log("Note: this backup does not include visitor sessions, so visitor data could not be restored.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
