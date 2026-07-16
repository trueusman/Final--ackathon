import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import {
  usersTable,
  assetsTable,
  issuesTable,
  maintenanceTable,
  historyTable,
  notificationsTable,
} from "./schema";

async function seed() {
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length > 0) {
    console.log("Clearing existing data...");
    // Clear all tables in reverse order (due to foreign keys)
    await db.delete(notificationsTable);
    await db.delete(historyTable);
    await db.delete(maintenanceTable);
    await db.delete(issuesTable);
    await db.delete(assetsTable);
    await db.delete(usersTable);
    console.log("Existing data cleared.");
  }

  // Demo user passwords - Each role has different access
  const adminPasswordHash = await bcrypt.hash("Admin@2024", 10);
  const technicianPasswordHash = await bcrypt.hash("Tech@2024", 10);
  const supervisorPasswordHash = await bcrypt.hash("Super@2024", 10);
  const reporterPasswordHash = await bcrypt.hash("Report@2024", 10);

  // ADMIN - Full system access
  const [admin] = await db
    .insert(usersTable)
    .values({
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      phone: "555-0100",
    })
    .returning();

  // TECHNICIAN - Can view and update assigned tasks
  const [tech1] = await db
    .insert(usersTable)
    .values({
      name: "Technician User",
      email: "tech@demo.com",
      passwordHash: technicianPasswordHash,
      role: "technician",
      phone: "555-0101",
    })
    .returning();

  // SUPERVISOR - Can manage team and assign tasks
  const [supervisor] = await db
    .insert(usersTable)
    .values({
      name: "Supervisor User",
      email: "super@demo.com",
      passwordHash: supervisorPasswordHash,
      role: "technician",
      phone: "555-0102",
    })
    .returning();

  // REPORTER - Can only report issues and view status
  const [reporter] = await db
    .insert(usersTable)
    .values({
      name: "Reporter User",
      email: "report@demo.com",
      passwordHash: reporterPasswordHash,
      role: "technician",
      phone: "555-0103",
    })
    .returning();

  if (!admin || !tech1 || !supervisor || !reporter) throw new Error("Failed to seed users");

  const [asset1] = await db
    .insert(assetsTable)
    .values({
      name: "Rooftop AHU-3",
      assetCode: "HVAC-003",
      category: "HVAC",
      location: "Building A - Roof",
      model: "Carrier 48TC",
      manufacturer: "Carrier",
      condition: "good",
      status: "operational",
      assignedTechnicianId: tech1.id,
      lastServiceDate: "2026-05-12",
      nextServiceDate: "2026-11-12",
    })
    .returning();

  const [asset2] = await db
    .insert(assetsTable)
    .values({
      name: "Backup Generator 2",
      assetCode: "GEN-002",
      category: "Power",
      location: "Building B - Basement",
      model: "Cummins C150D6",
      manufacturer: "Cummins",
      condition: "fair",
      status: "under_maintenance",
      assignedTechnicianId: supervisor.id,
      lastServiceDate: "2026-06-01",
      nextServiceDate: "2026-09-01",
    })
    .returning();

  const [asset3] = await db
    .insert(assetsTable)
    .values({
      name: "Passenger Elevator 1",
      assetCode: "ELV-001",
      category: "Elevator",
      location: "Building A - Lobby",
      model: "Otis Gen2",
      manufacturer: "Otis",
      condition: "excellent",
      status: "operational",
    })
    .returning();

  if (!asset1 || !asset2 || !asset3) throw new Error("Failed to seed assets");

  const [issue1] = await db
    .insert(issuesTable)
    .values({
      issueNumber: "ISS-SEED-0001",
      assetId: asset2.id,
      reporterName: "Building Security",
      reporterEmail: "security@example.com",
      title: "Generator failed weekly self-test",
      description:
        "The backup generator did not start during the scheduled Tuesday self-test cycle.",
      priority: "high",
      category: "Power",
      status: "maintenance_in_progress",
      assignedTechnicianId: supervisor.id,
      aiTitle: "Generator self-test failure",
      aiCategory: "Power",
      aiPriority: "high",
      aiPossibleCauses: [
        "Dead or degraded starter battery",
        "Fuel supply blockage",
        "Faulty transfer switch",
      ],
      aiDiagnosticChecks: [
        "Check starter battery voltage and terminals",
        "Inspect fuel lines and filters",
        "Verify automatic transfer switch signal",
      ],
      aiSafetyNotes:
        "De-energize the transfer switch before inspecting wiring. Follow lockout/tagout procedure.",
    })
    .returning();

  const [issue2] = await db
    .insert(issuesTable)
    .values({
      issueNumber: "ISS-SEED-0002",
      assetId: asset1.id,
      reporterName: "Facilities Front Desk",
      reporterEmail: "frontdesk@example.com",
      title: "Rooftop unit making loud noise",
      description: "Loud rattling noise coming from AHU-3 for the past two days.",
      priority: "medium",
      category: "HVAC",
      status: "resolved",
      assignedTechnicianId: tech1.id,
    })
    .returning();

  if (!issue1 || !issue2) throw new Error("Failed to seed issues");

  await db.insert(maintenanceTable).values({
    issueId: issue1.id,
    technicianId: supervisor.id,
    notes: "Replaced starter battery, generator now passes self-test.",
    cost: 245.5,
    replacementParts: ["12V starter battery"],
    timeSpentMinutes: 90,
  });

  await db.insert(maintenanceTable).values({
    issueId: issue2.id,
    technicianId: tech1.id,
    notes: "Tightened loose fan blade mount, noise resolved.",
    cost: 0,
    timeSpentMinutes: 45,
  });

  await db.insert(historyTable).values([
    {
      assetId: asset2.id,
      issueId: issue1.id,
      userName: "Building Security",
      action: "issue_reported",
      status: "reported",
      notes: issue1.title,
    },
    {
      assetId: asset2.id,
      issueId: issue1.id,
      userId: admin.id,
      userName: admin.name,
      action: "issue_assigned",
      status: "assigned",
      notes: `Assigned to ${supervisor.name}`,
    },
    {
      assetId: asset1.id,
      issueId: issue2.id,
      userName: "Facilities Front Desk",
      action: "issue_reported",
      status: "reported",
      notes: issue2.title,
    },
    {
      assetId: asset1.id,
      issueId: issue2.id,
      userId: tech1.id,
      userName: tech1.name,
      action: "status_changed",
      status: "resolved",
      notes: "Fixed loose fan blade mount",
    },
  ]);

  await db.insert(notificationsTable).values([
    {
      userId: supervisor.id,
      type: "issue_assigned",
      title: "New issue assigned",
      message: `You were assigned to "${issue1.title}"`,
    },
    {
      userId: admin.id,
      type: "issue_resolved",
      title: "Issue resolved",
      message: `"${issue2.title}" was marked resolved`,
      read: true,
    },
  ]);

  console.log("Seed complete.");
  console.log("\n========================================");
  console.log("  DEMO CREDENTIALS");
  console.log("========================================");
  console.log("Role          Email                 Password      Access Level");
  console.log("---------------------------------------------------------------");
  console.log("Admin         admin@demo.com        Admin@2024    Full Access");
  console.log("Technician    tech@demo.com         Tech@2024     Assigned Tasks");
  console.log("Supervisor    super@demo.com        Super@2024    Team Management");
  console.log("Reporter      report@demo.com       Report@2024   Report Issues");
  console.log("========================================\n");

  await pool.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
