import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full access',
    },
  });

  const l1Role = await prisma.role.create({
    data: {
      name: 'SOC L1',
      description: 'SOC Level 1 Analyst',
    },
  });

  const l2Role = await prisma.role.create({
    data: {
      name: 'SOC L2',
      description: 'SOC Level 2 Analyst',
    },
  });

  const engineerRole = await prisma.role.create({
    data: {
      name: 'SOC Engineer',
      description: 'SOC Engineer for alert tuning',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'SOC Manager',
      description: 'SOC Manager for reporting and oversight',
    },
  });

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      department: 'Security',
      roleId: adminRole.id,
    },
  });

  const l1User = await prisma.user.create({
    data: {
      email: 'l1@example.com',
      password: 'l1password',
      firstName: 'John',
      lastName: 'Analyst',
      department: 'SOC',
      roleId: l1Role.id,
    },
  });

  const l2User = await prisma.user.create({
    data: {
      email: 'l2@example.com',
      password: 'l2password',
      firstName: 'Jane',
      lastName: 'Investigator',
      department: 'SOC',
      roleId: l2Role.id,
    },
  });

  // Create test assets
  const asset1 = await prisma.asset.create({
    data: {
      hostname: 'PC-FINANCE-21',
      ip: '10.10.20.45',
      criticality: 'high',
      assetType: 'workstation',
      owner: 'Finance Team',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      hostname: 'WEB-SERVER-01',
      ip: '192.168.1.100',
      criticality: 'critical',
      assetType: 'server',
      owner: 'IT Team',
    },
  });

  // Create test alerts
  const now = new Date();

  const alert1 = await prisma.alert.create({
    data: {
      source: 'wazuh',
      name: 'Spike of Domain Discovery Commands',
      severity: 'high',
      status: 'new',
      verdict: 'unclassified',
      alertTime: new Date(now.getTime() - 3600000), // 1 hour ago
      eventTime: new Date(now.getTime() - 3700000),
      assetId: asset1.id,
      username: 'jsmith',
      sourceIp: '10.10.20.45',
      destinationIp: '8.8.8.8',
      destinationPort: 53,
      protocol: 'DNS',
      mitreTactic: 'Discovery',
      mitreTechnique: 'T1087',
      ruleId: '5712',
      priorityScore: 75,
      rawEvent: {
        rule_id: '5712',
        agent_name: 'PC-FINANCE-21',
        command_line: 'nslookup, whoami, net view',
      },
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      source: 'deep-security',
      name: 'Unauthorized Administrative Access Attempt',
      severity: 'critical',
      status: 'new',
      verdict: 'unclassified',
      alertTime: new Date(now.getTime() - 7200000), // 2 hours ago
      eventTime: new Date(now.getTime() - 7300000),
      assetId: asset2.id,
      username: 'admin',
      sourceIp: '203.0.113.45',
      destinationIp: '192.168.1.100',
      destinationPort: 3389,
      protocol: 'RDP',
      mitreTactic: 'Lateral Movement',
      mitreTechnique: 'T1021',
      ruleId: '1024',
      priorityScore: 145,
      rawEvent: {
        rule_id: '1024',
        threat_name: 'Unauthorized RDP Access',
      },
    },
  });

  const alert3 = await prisma.alert.create({
    data: {
      source: 'firewall',
      name: 'Suspicious Outbound Connection',
      severity: 'medium',
      status: 'in_progress',
      verdict: 'unclassified',
      alertTime: new Date(now.getTime() - 1800000), // 30 mins ago
      eventTime: new Date(now.getTime() - 1900000),
      assetId: asset1.id,
      sourceIp: '10.10.20.45',
      destinationIp: '185.220.101.1',
      destinationPort: 443,
      protocol: 'HTTPS',
      mitreTactic: 'Exfiltration',
      mitreTechnique: 'T1041',
      ruleId: '2048',
      priorityScore: 65,
    },
  });

  console.log('Database seeded successfully');
  console.log('\nTest Credentials:');
  console.log('Admin - admin@example.com / admin123');
  console.log('L1 Analyst - l1@example.com / l1password');
  console.log('L2 Analyst - l2@example.com / l2password');
  console.log('\nTest Alerts Created: 3');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
