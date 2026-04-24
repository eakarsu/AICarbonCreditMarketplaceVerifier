const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'trader', 'verifier', 'project_owner'), defaultValue: 'trader' },
  company: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING }
});

// Carbon Credit Model
const CarbonCredit = sequelize.define('CarbonCredit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  projectType: { type: DataTypes.STRING, allowNull: false },
  vintage: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  pricePerTon: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('available', 'reserved', 'sold', 'retired'), defaultValue: 'available' },
  registry: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  methodology: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  co2OffsetTons: { type: DataTypes.FLOAT },
  verificationStatus: { type: DataTypes.ENUM('pending', 'verified', 'rejected', 'under_review'), defaultValue: 'pending' },
  sellerId: { type: DataTypes.INTEGER }
});

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  creditId: { type: DataTypes.INTEGER, allowNull: false },
  buyerId: { type: DataTypes.INTEGER },
  sellerId: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  transactionType: { type: DataTypes.ENUM('buy', 'sell', 'retire', 'transfer'), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed'), defaultValue: 'pending' },
  transactionHash: { type: DataTypes.STRING },
  fee: { type: DataTypes.FLOAT, defaultValue: 0 }
});

// Project Model
const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  estimatedReduction: { type: DataTypes.FLOAT },
  actualReduction: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM('proposed', 'active', 'completed', 'suspended'), defaultValue: 'proposed' },
  description: { type: DataTypes.TEXT },
  ownerId: { type: DataTypes.INTEGER },
  methodology: { type: DataTypes.STRING },
  sdgGoals: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.STRING }
});

// Verification Model
const Verification = sequelize.define('Verification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  creditId: { type: DataTypes.INTEGER },
  projectId: { type: DataTypes.INTEGER },
  verifierId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected'), defaultValue: 'pending' },
  methodology: { type: DataTypes.STRING },
  findings: { type: DataTypes.TEXT },
  aiScore: { type: DataTypes.FLOAT },
  aiAnalysis: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  documentUrl: { type: DataTypes.STRING }
});

// Emission Model
const Emission = sequelize.define('Emission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  category: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  unit: { type: DataTypes.STRING, defaultValue: 'tCO2e' },
  date: { type: DataTypes.DATE },
  scope: { type: DataTypes.ENUM('scope1', 'scope2', 'scope3'), defaultValue: 'scope1' },
  description: { type: DataTypes.TEXT }
});

// MarketData Model
const MarketData = sequelize.define('MarketData', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  creditType: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  volume: { type: DataTypes.FLOAT },
  date: { type: DataTypes.DATE },
  exchange: { type: DataTypes.STRING },
  change: { type: DataTypes.FLOAT },
  changePercent: { type: DataTypes.FLOAT }
});

// Retirement Model
const Retirement = sequelize.define('Retirement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  creditId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  reason: { type: DataTypes.TEXT },
  beneficiary: { type: DataTypes.STRING },
  retirementDate: { type: DataTypes.DATE },
  certificateUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), defaultValue: 'pending' }
});

// ComplianceReport Model
const ComplianceReport = sequelize.define('ComplianceReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  reportType: { type: DataTypes.STRING, allowNull: false },
  period: { type: DataTypes.STRING },
  totalEmissions: { type: DataTypes.FLOAT },
  totalOffsets: { type: DataTypes.FLOAT },
  netEmissions: { type: DataTypes.FLOAT },
  complianceStatus: { type: DataTypes.ENUM('compliant', 'non_compliant', 'pending_review'), defaultValue: 'pending_review' },
  aiRecommendations: { type: DataTypes.TEXT },
  regulatoryFramework: { type: DataTypes.STRING },
  dueDate: { type: DataTypes.DATE }
});

// AuditLog Model
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING },
  entityId: { type: DataTypes.INTEGER },
  details: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Offset Recommendation Model
const OffsetRecommendation = sequelize.define('OffsetRecommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  emissionAmount: { type: DataTypes.FLOAT },
  recommendedCredits: { type: DataTypes.TEXT },
  aiAnalysis: { type: DataTypes.TEXT },
  estimatedCost: { type: DataTypes.FLOAT },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' }
});

// Sustainability Report Model
const SustainabilityReport = sequelize.define('SustainabilityReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  period: { type: DataTypes.STRING },
  totalEmissions: { type: DataTypes.FLOAT },
  reductionTarget: { type: DataTypes.FLOAT },
  actualReduction: { type: DataTypes.FLOAT },
  aiInsights: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
  frameworks: { type: DataTypes.STRING }
});

// Associations
CarbonCredit.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
Transaction.belongsTo(CarbonCredit, { foreignKey: 'creditId' });
Transaction.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Transaction.belongsTo(User, { as: 'sellerUser', foreignKey: 'sellerId' });
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Verification.belongsTo(CarbonCredit, { foreignKey: 'creditId' });
Verification.belongsTo(Project, { foreignKey: 'projectId' });
Emission.belongsTo(User, { foreignKey: 'userId' });
Retirement.belongsTo(CarbonCredit, { foreignKey: 'creditId' });
Retirement.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  CarbonCredit,
  Transaction,
  Project,
  Verification,
  Emission,
  MarketData,
  Retirement,
  ComplianceReport,
  AuditLog,
  OffsetRecommendation,
  SustainabilityReport
};
