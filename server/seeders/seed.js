const bcrypt = require('bcryptjs');
require('dotenv').config();
const { sequelize, User, CarbonCredit, Transaction, Project, Verification, Emission, MarketData, Retirement, ComplianceReport, AuditLog, OffsetRecommendation, SustainabilityReport } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // Users
    const password = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      { name: 'Admin User', email: 'admin@carbonmarket.com', password, role: 'admin', company: 'CarbonMarket Inc.' },
      { name: 'Jane Smith', email: 'jane@greentech.com', password, role: 'trader', company: 'GreenTech Solutions' },
      { name: 'Bob Wilson', email: 'bob@verifyco.com', password, role: 'verifier', company: 'VerifyCO2 Ltd.' },
      { name: 'Alice Chen', email: 'alice@ecoproject.org', password, role: 'project_owner', company: 'EcoProject Foundation' },
      { name: 'David Kumar', email: 'david@sustaincorp.com', password, role: 'trader', company: 'SustainCorp' },
    ]);
    console.log('Users seeded');

    // Carbon Credits (15+)
    const credits = await CarbonCredit.bulkCreate([
      { name: 'Amazon Reforestation VCS-2024', projectType: 'Reforestation', vintage: 2024, quantity: 5000, pricePerTon: 18.50, status: 'available', registry: 'Verra VCS', country: 'Brazil', methodology: 'VM0047', description: 'Large-scale reforestation in the Amazon basin', co2OffsetTons: 5000, verificationStatus: 'verified', sellerId: 2 },
      { name: 'India Solar Farm Gold Standard', projectType: 'Renewable Energy', vintage: 2023, quantity: 10000, pricePerTon: 12.75, status: 'available', registry: 'Gold Standard', country: 'India', methodology: 'GS-RE', description: 'Solar energy generation displacing coal power', co2OffsetTons: 10000, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Kenya Cookstove Project', projectType: 'Energy Efficiency', vintage: 2024, quantity: 3000, pricePerTon: 22.00, status: 'available', registry: 'Gold Standard', country: 'Kenya', methodology: 'GS-TPDDTEC', description: 'Distribution of efficient cookstoves to rural communities', co2OffsetTons: 3000, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Indonesia Mangrove Conservation', projectType: 'Blue Carbon', vintage: 2024, quantity: 2000, pricePerTon: 35.00, status: 'available', registry: 'Verra VCS', country: 'Indonesia', methodology: 'VM0033', description: 'Protection of coastal mangrove forests', co2OffsetTons: 2000, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Uruguay Wind Farm Credits', projectType: 'Renewable Energy', vintage: 2023, quantity: 8000, pricePerTon: 9.50, status: 'available', registry: 'CDM', country: 'Uruguay', methodology: 'ACM0002', description: 'Wind energy generation project', co2OffsetTons: 8000, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Congo Basin REDD+ Project', projectType: 'Avoided Deforestation', vintage: 2024, quantity: 15000, pricePerTon: 14.25, status: 'available', registry: 'Verra VCS', country: 'DR Congo', methodology: 'VM0015', description: 'Reducing emissions from deforestation and degradation', co2OffsetTons: 15000, verificationStatus: 'under_review', sellerId: 4 },
      { name: 'China Biogas Methane Capture', projectType: 'Methane Capture', vintage: 2023, quantity: 4500, pricePerTon: 11.00, status: 'available', registry: 'CDM', country: 'China', methodology: 'AMS-III.D', description: 'Agricultural biogas recovery and utilization', co2OffsetTons: 4500, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Scotland Peatland Restoration', projectType: 'Soil Carbon', vintage: 2024, quantity: 1500, pricePerTon: 42.00, status: 'available', registry: 'Peatland Code', country: 'UK', methodology: 'PC-v2.0', description: 'Restoration of degraded peatland ecosystems', co2OffsetTons: 1500, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Costa Rica Forest Conservation', projectType: 'REDD+', vintage: 2024, quantity: 6000, pricePerTon: 16.50, status: 'available', registry: 'Verra VCS', country: 'Costa Rica', methodology: 'VM0009', description: 'Tropical forest conservation and community engagement', co2OffsetTons: 6000, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Pakistan Clean Water Project', projectType: 'Water Purification', vintage: 2023, quantity: 2500, pricePerTon: 19.75, status: 'available', registry: 'Gold Standard', country: 'Pakistan', methodology: 'GS-WP', description: 'Providing clean water to reduce wood fuel for boiling', co2OffsetTons: 2500, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Chile Geothermal Energy Credits', projectType: 'Renewable Energy', vintage: 2024, quantity: 7000, pricePerTon: 13.50, status: 'available', registry: 'CDM', country: 'Chile', methodology: 'ACM0002', description: 'Geothermal power generation displacing fossil fuels', co2OffsetTons: 7000, verificationStatus: 'pending', sellerId: 2 },
      { name: 'Madagascar Agroforestry', projectType: 'Agroforestry', vintage: 2024, quantity: 1800, pricePerTon: 28.00, status: 'available', registry: 'Plan Vivo', country: 'Madagascar', methodology: 'PV-AG', description: 'Community agroforestry enhancing biodiversity', co2OffsetTons: 1800, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Vietnam Improved Rice Cultivation', projectType: 'Agriculture', vintage: 2023, quantity: 3500, pricePerTon: 8.75, status: 'available', registry: 'Gold Standard', country: 'Vietnam', methodology: 'GS-AGRI', description: 'Alternate wetting and drying rice cultivation', co2OffsetTons: 3500, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Norway Direct Air Capture', projectType: 'Carbon Removal', vintage: 2024, quantity: 500, pricePerTon: 250.00, status: 'available', registry: 'Puro.earth', country: 'Norway', methodology: 'DAC-v1', description: 'Technological carbon dioxide removal from atmosphere', co2OffsetTons: 500, verificationStatus: 'verified', sellerId: 4 },
      { name: 'Australia Savanna Fire Mgmt', projectType: 'Fire Management', vintage: 2024, quantity: 4000, pricePerTon: 21.50, status: 'available', registry: 'ERF', country: 'Australia', methodology: 'ERF-SFM', description: 'Indigenous-led early dry season burning reducing emissions', co2OffsetTons: 4000, verificationStatus: 'verified', sellerId: 2 },
      { name: 'Ethiopia Clean Energy Access', projectType: 'Renewable Energy', vintage: 2023, quantity: 2200, pricePerTon: 15.00, status: 'sold', registry: 'Gold Standard', country: 'Ethiopia', methodology: 'GS-CE', description: 'Solar home systems for off-grid communities', co2OffsetTons: 2200, verificationStatus: 'verified', sellerId: 4 },
    ]);
    console.log('Carbon Credits seeded');

    // Transactions (15+)
    await Transaction.bulkCreate([
      { creditId: 1, buyerId: 5, sellerId: 2, quantity: 500, totalPrice: 9250, transactionType: 'buy', status: 'completed', transactionHash: 'TX-ABC12345', fee: 231.25 },
      { creditId: 2, buyerId: 1, sellerId: 4, quantity: 1000, totalPrice: 12750, transactionType: 'buy', status: 'completed', transactionHash: 'TX-DEF67890', fee: 318.75 },
      { creditId: 3, buyerId: 5, sellerId: 2, quantity: 200, totalPrice: 4400, transactionType: 'buy', status: 'completed', transactionHash: 'TX-GHI11111', fee: 110 },
      { creditId: 4, buyerId: 1, sellerId: 4, quantity: 300, totalPrice: 10500, transactionType: 'buy', status: 'pending', transactionHash: 'TX-JKL22222', fee: 262.50 },
      { creditId: 5, buyerId: 5, sellerId: 2, quantity: 2000, totalPrice: 19000, transactionType: 'buy', status: 'completed', transactionHash: 'TX-MNO33333', fee: 475 },
      { creditId: 16, buyerId: 1, sellerId: 4, quantity: 2200, totalPrice: 33000, transactionType: 'buy', status: 'completed', transactionHash: 'TX-PQR44444', fee: 825 },
      { creditId: 7, buyerId: 5, sellerId: 2, quantity: 500, totalPrice: 5500, transactionType: 'buy', status: 'completed', transactionHash: 'TX-STU55555', fee: 137.50 },
      { creditId: 9, buyerId: 1, sellerId: 2, quantity: 1000, totalPrice: 16500, transactionType: 'buy', status: 'completed', transactionHash: 'TX-VWX66666', fee: 412.50 },
      { creditId: 1, buyerId: 1, sellerId: 2, quantity: 100, totalPrice: 1850, transactionType: 'retire', status: 'completed', transactionHash: 'TX-RET77777', fee: 46.25 },
      { creditId: 10, buyerId: 5, sellerId: 4, quantity: 500, totalPrice: 9875, transactionType: 'buy', status: 'pending', transactionHash: 'TX-YZA88888', fee: 246.88 },
      { creditId: 8, buyerId: 1, sellerId: 4, quantity: 200, totalPrice: 8400, transactionType: 'buy', status: 'completed', transactionHash: 'TX-BCD99999', fee: 210 },
      { creditId: 12, buyerId: 5, sellerId: 4, quantity: 300, totalPrice: 8400, transactionType: 'buy', status: 'completed', transactionHash: 'TX-EFG10101', fee: 210 },
      { creditId: 14, buyerId: 1, sellerId: 4, quantity: 50, totalPrice: 12500, transactionType: 'buy', status: 'completed', transactionHash: 'TX-HIJ20202', fee: 312.50 },
      { creditId: 15, buyerId: 5, sellerId: 2, quantity: 1000, totalPrice: 21500, transactionType: 'buy', status: 'failed', transactionHash: 'TX-KLM30303', fee: 537.50 },
      { creditId: 6, buyerId: 1, sellerId: 4, quantity: 5000, totalPrice: 71250, transactionType: 'buy', status: 'pending', transactionHash: 'TX-NOP40404', fee: 1781.25 },
      { creditId: 13, buyerId: 5, sellerId: 2, quantity: 1500, totalPrice: 13125, transactionType: 'transfer', status: 'completed', transactionHash: 'TX-QRS50505', fee: 328.13 },
    ]);
    console.log('Transactions seeded');

    // Projects (15+)
    await Project.bulkCreate([
      { name: 'Amazon Green Belt Initiative', type: 'Reforestation', location: 'Manaus', country: 'Brazil', startDate: '2023-01-15', estimatedReduction: 50000, actualReduction: 35000, status: 'active', description: 'Planting native trees across 10,000 hectares of degraded Amazon land', ownerId: 4, methodology: 'VM0047', sdgGoals: '13,15,1' },
      { name: 'Rajasthan Solar Mega Park', type: 'Solar Energy', location: 'Jaisalmer', country: 'India', startDate: '2022-06-01', estimatedReduction: 100000, actualReduction: 85000, status: 'active', description: '500MW solar installation in Thar Desert', ownerId: 4, methodology: 'GS-RE', sdgGoals: '7,13,8' },
      { name: 'Lake Turkana Wind Power', type: 'Wind Energy', location: 'Marsabit', country: 'Kenya', startDate: '2021-09-15', estimatedReduction: 75000, actualReduction: 72000, status: 'active', description: '310MW wind farm in northern Kenya', ownerId: 2, methodology: 'ACM0002', sdgGoals: '7,13,9' },
      { name: 'Borneo Rainforest Protection', type: 'REDD+', location: 'Sarawak', country: 'Malaysia', startDate: '2023-03-01', estimatedReduction: 200000, actualReduction: null, status: 'active', description: 'Protecting 500,000 hectares of pristine rainforest', ownerId: 4, methodology: 'VM0015', sdgGoals: '13,15,6' },
      { name: 'Sahel Great Green Wall', type: 'Agroforestry', location: 'Sahel Region', country: 'Senegal', startDate: '2022-01-01', estimatedReduction: 30000, actualReduction: 12000, status: 'active', description: 'Part of the Great Green Wall initiative to combat desertification', ownerId: 2, methodology: 'PV-AG', sdgGoals: '13,15,2,1' },
      { name: 'Iceland Geothermal Expansion', type: 'Geothermal', location: 'Reykjanes', country: 'Iceland', startDate: '2024-01-10', estimatedReduction: 25000, actualReduction: null, status: 'proposed', description: 'Expanding geothermal capacity with carbon mineralization', ownerId: 4, methodology: 'CDM-GEO', sdgGoals: '7,13,9' },
      { name: 'Patagonia Peatland Restoration', type: 'Wetland Restoration', location: 'Tierra del Fuego', country: 'Argentina', startDate: '2023-06-15', estimatedReduction: 8000, actualReduction: 3000, status: 'active', description: 'Restoring damaged peatland ecosystems in southern Patagonia', ownerId: 2, methodology: 'PC-v2.0', sdgGoals: '13,15,6' },
      { name: 'Bangladesh Improved Cookstoves', type: 'Energy Efficiency', location: 'Dhaka Division', country: 'Bangladesh', startDate: '2022-08-01', estimatedReduction: 15000, actualReduction: 13500, status: 'active', description: 'Distributing 50,000 improved cookstoves to reduce deforestation', ownerId: 4, methodology: 'GS-TPDDTEC', sdgGoals: '3,5,13,15' },
      { name: 'Canadian Boreal Forest Conservation', type: 'Forest Conservation', location: 'Ontario', country: 'Canada', startDate: '2023-04-01', estimatedReduction: 120000, actualReduction: null, status: 'active', description: 'Protecting old-growth boreal forest from logging', ownerId: 2, methodology: 'VM0009', sdgGoals: '13,15' },
      { name: 'Morocco Concentrated Solar', type: 'Solar Energy', location: 'Ouarzazate', country: 'Morocco', startDate: '2021-12-01', estimatedReduction: 60000, actualReduction: 55000, status: 'active', description: 'Noor-Ouarzazate concentrated solar power complex expansion', ownerId: 4, methodology: 'ACM0002', sdgGoals: '7,13,8,9' },
      { name: 'Philippines Mangrove Planting', type: 'Blue Carbon', location: 'Palawan', country: 'Philippines', startDate: '2023-07-01', estimatedReduction: 5000, actualReduction: 2000, status: 'active', description: 'Community-led mangrove restoration along coastlines', ownerId: 2, methodology: 'VM0033', sdgGoals: '13,14,15,1' },
      { name: 'Swiss Direct Air Capture', type: 'Carbon Removal', location: 'Zurich', country: 'Switzerland', startDate: '2024-02-01', estimatedReduction: 1000, actualReduction: null, status: 'proposed', description: 'Climeworks DAC technology deployment for permanent removal', ownerId: 4, methodology: 'DAC-v1', sdgGoals: '13,9' },
      { name: 'Tanzania Biochar Production', type: 'Biochar', location: 'Arusha', country: 'Tanzania', startDate: '2023-09-01', estimatedReduction: 4000, actualReduction: 1500, status: 'active', description: 'Converting agricultural waste to biochar for soil carbon sequestration', ownerId: 2, methodology: 'PV-BC', sdgGoals: '2,13,15' },
      { name: 'Peru Community Forest Management', type: 'Community Forestry', location: 'Ucayali', country: 'Peru', startDate: '2022-05-15', estimatedReduction: 35000, actualReduction: 28000, status: 'active', description: 'Indigenous community-managed forest conservation program', ownerId: 4, methodology: 'VM0015', sdgGoals: '1,10,13,15' },
      { name: 'Sweden Biogas from Waste', type: 'Waste Management', location: 'Malmö', country: 'Sweden', startDate: '2023-01-01', estimatedReduction: 12000, actualReduction: 10000, status: 'active', description: 'Converting municipal organic waste into biogas for transport', ownerId: 2, methodology: 'AMS-III.D', sdgGoals: '7,11,12,13' },
      { name: 'Nepal Micro-Hydro Network', type: 'Hydropower', location: 'Solukhumbu', country: 'Nepal', startDate: '2023-11-01', estimatedReduction: 3000, actualReduction: null, status: 'proposed', description: 'Network of micro-hydro power stations for remote villages', ownerId: 4, methodology: 'AMS-I.D', sdgGoals: '1,7,13' },
    ]);
    console.log('Projects seeded');

    // Verifications (15+)
    await Verification.bulkCreate([
      { creditId: 1, projectId: 1, verifierId: 3, status: 'approved', methodology: 'VM0047', findings: 'All documentation verified. Carbon sequestration rates confirmed.', aiScore: 92, riskLevel: 'low' },
      { creditId: 2, projectId: 2, verifierId: 3, status: 'approved', methodology: 'GS-RE', findings: 'Solar output data verified against grid records.', aiScore: 95, riskLevel: 'low' },
      { creditId: 3, projectId: 8, verifierId: 3, status: 'approved', methodology: 'GS-TPDDTEC', findings: 'Cookstove distribution records and usage monitoring confirmed.', aiScore: 88, riskLevel: 'low' },
      { creditId: 4, projectId: 11, verifierId: 3, status: 'approved', methodology: 'VM0033', findings: 'Mangrove biomass measurements verified via satellite imagery.', aiScore: 90, riskLevel: 'low' },
      { creditId: 5, projectId: 3, verifierId: 3, status: 'approved', methodology: 'ACM0002', findings: 'Wind generation data cross-referenced with grid operator.', aiScore: 94, riskLevel: 'low' },
      { creditId: 6, projectId: 4, verifierId: 3, status: 'in_progress', methodology: 'VM0015', findings: 'Satellite analysis ongoing. Initial deforestation baseline established.', aiScore: 72, riskLevel: 'medium' },
      { creditId: 7, projectId: 15, verifierId: 3, status: 'approved', methodology: 'AMS-III.D', findings: 'Biogas capture rates confirmed through metering data.', aiScore: 86, riskLevel: 'low' },
      { creditId: 8, projectId: 7, verifierId: 3, status: 'approved', methodology: 'PC-v2.0', findings: 'Peatland water table levels confirmed restoration progress.', aiScore: 91, riskLevel: 'low' },
      { creditId: 9, projectId: 14, verifierId: 3, status: 'approved', methodology: 'VM0009', findings: 'Community forest management practices verified on-site.', aiScore: 89, riskLevel: 'low' },
      { creditId: 10, projectId: 8, verifierId: 3, status: 'approved', methodology: 'GS-WP', findings: 'Water quality improvements and fuel reduction documented.', aiScore: 87, riskLevel: 'low' },
      { creditId: 11, projectId: 10, verifierId: 3, status: 'pending', methodology: 'ACM0002', findings: null, aiScore: null, riskLevel: 'medium' },
      { creditId: 12, projectId: 5, verifierId: 3, status: 'approved', methodology: 'PV-AG', findings: 'Agroforestry plots surveyed, biomass growth on track.', aiScore: 83, riskLevel: 'low' },
      { creditId: 13, projectId: null, verifierId: 3, status: 'approved', methodology: 'GS-AGRI', findings: 'Rice cultivation methodology properly applied across 5000 hectares.', aiScore: 85, riskLevel: 'low' },
      { creditId: 14, projectId: 12, verifierId: 3, status: 'approved', methodology: 'DAC-v1', findings: 'Direct air capture volumes verified through independent metering.', aiScore: 97, riskLevel: 'low' },
      { creditId: 15, projectId: null, verifierId: 3, status: 'approved', methodology: 'ERF-SFM', findings: 'Fire management records and satellite data confirm emission reductions.', aiScore: 90, riskLevel: 'low' },
      { creditId: 16, projectId: null, verifierId: 3, status: 'rejected', methodology: 'GS-CE', findings: 'Insufficient monitoring data for solar home system usage.', aiScore: 45, riskLevel: 'high' },
    ]);
    console.log('Verifications seeded');

    // Emissions (15+)
    await Emission.bulkCreate([
      { userId: 1, category: 'Transportation', source: 'Company Fleet', amount: 1250.5, unit: 'tCO2e', date: '2024-01-15', scope: 'scope1', description: 'Diesel and gasoline consumption for company vehicles' },
      { userId: 1, category: 'Electricity', source: 'Office Buildings', amount: 890.3, unit: 'tCO2e', date: '2024-01-15', scope: 'scope2', description: 'Grid electricity consumption across 3 office locations' },
      { userId: 1, category: 'Natural Gas', source: 'Heating', amount: 456.2, unit: 'tCO2e', date: '2024-01-15', scope: 'scope1', description: 'Natural gas for office heating systems' },
      { userId: 2, category: 'Air Travel', source: 'Business Flights', amount: 320.8, unit: 'tCO2e', date: '2024-02-01', scope: 'scope3', description: 'Employee business travel by air' },
      { userId: 2, category: 'Supply Chain', source: 'Raw Materials', amount: 2100.0, unit: 'tCO2e', date: '2024-02-01', scope: 'scope3', description: 'Upstream emissions from material procurement' },
      { userId: 5, category: 'Manufacturing', source: 'Production Line', amount: 3500.0, unit: 'tCO2e', date: '2024-01-20', scope: 'scope1', description: 'Direct emissions from manufacturing processes' },
      { userId: 5, category: 'Waste', source: 'Landfill Disposal', amount: 180.5, unit: 'tCO2e', date: '2024-01-20', scope: 'scope3', description: 'Emissions from waste sent to landfill' },
      { userId: 1, category: 'Commuting', source: 'Employee Commutes', amount: 420.0, unit: 'tCO2e', date: '2024-03-01', scope: 'scope3', description: 'Estimated emissions from employee daily commutes' },
      { userId: 2, category: 'Refrigerants', source: 'HVAC Systems', amount: 75.3, unit: 'tCO2e', date: '2024-03-15', scope: 'scope1', description: 'Fugitive emissions from refrigerant leakage' },
      { userId: 5, category: 'Purchased Goods', source: 'IT Equipment', amount: 560.0, unit: 'tCO2e', date: '2024-02-15', scope: 'scope3', description: 'Embodied carbon in purchased electronics and servers' },
      { userId: 1, category: 'Water', source: 'Water Treatment', amount: 45.2, unit: 'tCO2e', date: '2024-04-01', scope: 'scope3', description: 'Emissions from water supply and treatment' },
      { userId: 2, category: 'Logistics', source: 'Product Distribution', amount: 890.0, unit: 'tCO2e', date: '2024-04-01', scope: 'scope3', description: 'Downstream distribution and transportation' },
      { userId: 5, category: 'Construction', source: 'New Facility', amount: 1500.0, unit: 'tCO2e', date: '2024-03-20', scope: 'scope3', description: 'Construction of new warehouse facility' },
      { userId: 1, category: 'Data Centers', source: 'Cloud Services', amount: 230.0, unit: 'tCO2e', date: '2024-05-01', scope: 'scope3', description: 'Emissions from cloud computing and data storage' },
      { userId: 2, category: 'Paper', source: 'Office Consumption', amount: 12.5, unit: 'tCO2e', date: '2024-05-15', scope: 'scope3', description: 'Paper usage across all office locations' },
      { userId: 5, category: 'Diesel', source: 'Backup Generators', amount: 95.0, unit: 'tCO2e', date: '2024-04-20', scope: 'scope1', description: 'Diesel consumption for emergency generators' },
    ]);
    console.log('Emissions seeded');

    // Market Data (15+)
    const baseDate = new Date('2024-06-01');
    await MarketData.bulkCreate([
      { creditType: 'Nature-based (VCS)', price: 15.20, volume: 125000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'CBL', change: 0.35, changePercent: 2.35 },
      { creditType: 'Nature-based (VCS)', price: 14.85, volume: 98000, date: new Date(baseDate.getTime() - 1 * 86400000), exchange: 'CBL', change: -0.40, changePercent: -2.62 },
      { creditType: 'Renewable Energy (GS)', price: 12.50, volume: 210000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'CBL', change: 0.15, changePercent: 1.21 },
      { creditType: 'Renewable Energy (GS)', price: 12.35, volume: 185000, date: new Date(baseDate.getTime() - 1 * 86400000), exchange: 'CBL', change: -0.20, changePercent: -1.59 },
      { creditType: 'EU ETS Allowance', price: 65.30, volume: 450000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'ICE', change: 1.20, changePercent: 1.87 },
      { creditType: 'EU ETS Allowance', price: 64.10, volume: 420000, date: new Date(baseDate.getTime() - 1 * 86400000), exchange: 'ICE', change: -0.80, changePercent: -1.23 },
      { creditType: 'Tech Carbon Removal', price: 185.00, volume: 5000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'Puro.earth', change: 5.00, changePercent: 2.78 },
      { creditType: 'Tech Carbon Removal', price: 180.00, volume: 4200, date: new Date(baseDate.getTime() - 1 * 86400000), exchange: 'Puro.earth', change: 3.50, changePercent: 1.98 },
      { creditType: 'CORSIA Eligible', price: 8.75, volume: 350000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'Xpansiv', change: -0.10, changePercent: -1.13 },
      { creditType: 'Blue Carbon', price: 32.50, volume: 15000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'CBL', change: 1.50, changePercent: 4.84 },
      { creditType: 'Cookstove Credits', price: 20.00, volume: 45000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'Gold Standard', change: 0.50, changePercent: 2.56 },
      { creditType: 'Biochar Credits', price: 45.00, volume: 8000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'Puro.earth', change: 2.00, changePercent: 4.65 },
      { creditType: 'California CCA', price: 32.80, volume: 280000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'ICE', change: 0.30, changePercent: 0.92 },
      { creditType: 'RGGI Allowance', price: 14.20, volume: 190000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'RGGI', change: -0.15, changePercent: -1.05 },
      { creditType: 'Voluntary Carbon (Avg)', price: 18.90, volume: 520000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'Composite', change: 0.45, changePercent: 2.44 },
      { creditType: 'Article 6 Credits', price: 22.00, volume: 30000, date: new Date(baseDate.getTime() - 0 * 86400000), exchange: 'UNFCCC', change: 1.00, changePercent: 4.76 },
    ]);
    console.log('Market Data seeded');

    // Retirements (15+)
    await Retirement.bulkCreate([
      { creditId: 1, userId: 1, quantity: 100, reason: 'Annual corporate carbon neutrality commitment', beneficiary: 'CarbonMarket Inc.', retirementDate: '2024-03-15', status: 'completed' },
      { creditId: 2, userId: 5, quantity: 500, reason: 'Product lifecycle carbon offset', beneficiary: 'SustainCorp Product Line', retirementDate: '2024-04-01', status: 'completed' },
      { creditId: 3, userId: 1, quantity: 200, reason: 'Event carbon neutrality - Annual Conference', beneficiary: 'GreenTech Annual Summit 2024', retirementDate: '2024-05-10', status: 'completed' },
      { creditId: 5, userId: 2, quantity: 1000, reason: 'Client offset program', beneficiary: 'GreenTech Solutions Clients', retirementDate: '2024-02-28', status: 'completed' },
      { creditId: 7, userId: 5, quantity: 300, reason: 'Supply chain emissions offset', beneficiary: 'SustainCorp Supply Chain', retirementDate: '2024-03-30', status: 'completed' },
      { creditId: 9, userId: 1, quantity: 500, reason: 'Quarterly compliance offset', beneficiary: 'CarbonMarket Inc. Q1 2024', retirementDate: '2024-04-15', status: 'completed' },
      { creditId: 10, userId: 2, quantity: 250, reason: 'Employee travel offset program', beneficiary: 'GreenTech Employee Program', retirementDate: '2024-05-01', status: 'completed' },
      { creditId: 12, userId: 5, quantity: 150, reason: 'Biodiversity commitment', beneficiary: 'SustainCorp Biodiversity Fund', retirementDate: '2024-04-20', status: 'completed' },
      { creditId: 4, userId: 1, quantity: 100, reason: 'Blue carbon voluntary commitment', beneficiary: 'CarbonMarket Ocean Initiative', retirementDate: '2024-06-01', status: 'pending' },
      { creditId: 13, userId: 2, quantity: 500, reason: 'Agricultural supply chain offset', beneficiary: 'GreenTech Agri Partners', retirementDate: '2024-05-15', status: 'completed' },
      { creditId: 15, userId: 5, quantity: 200, reason: 'Indigenous partnership commitment', beneficiary: 'SustainCorp Indigenous Fund', retirementDate: '2024-03-01', status: 'completed' },
      { creditId: 8, userId: 1, quantity: 50, reason: 'Premium offset for board meeting', beneficiary: 'CarbonMarket Board', retirementDate: '2024-06-10', status: 'pending' },
      { creditId: 14, userId: 2, quantity: 25, reason: 'Technology carbon removal commitment', beneficiary: 'GreenTech Net-Zero Pledge', retirementDate: '2024-05-20', status: 'completed' },
      { creditId: 1, userId: 5, quantity: 400, reason: 'Annual sustainability target', beneficiary: 'SustainCorp FY2024', retirementDate: '2024-04-30', status: 'completed' },
      { creditId: 6, userId: 1, quantity: 1000, reason: 'REDD+ voluntary commitment', beneficiary: 'CarbonMarket Forest Fund', retirementDate: '2024-06-15', status: 'pending' },
    ]);
    console.log('Retirements seeded');

    // Compliance Reports (15+)
    await ComplianceReport.bulkCreate([
      { userId: 1, reportType: 'Annual Carbon Report', period: 'FY 2023', totalEmissions: 5200, totalOffsets: 4800, netEmissions: 400, complianceStatus: 'compliant', regulatoryFramework: 'EU ETS', dueDate: '2024-03-31' },
      { userId: 2, reportType: 'Quarterly Disclosure', period: 'Q1 2024', totalEmissions: 1350, totalOffsets: 1200, netEmissions: 150, complianceStatus: 'compliant', regulatoryFramework: 'TCFD', dueDate: '2024-04-30' },
      { userId: 5, reportType: 'Annual Carbon Report', period: 'FY 2023', totalEmissions: 8500, totalOffsets: 6000, netEmissions: 2500, complianceStatus: 'non_compliant', regulatoryFramework: 'California Cap-and-Trade', dueDate: '2024-03-31' },
      { userId: 1, reportType: 'CDP Disclosure', period: '2023', totalEmissions: 5200, totalOffsets: 4800, netEmissions: 400, complianceStatus: 'compliant', regulatoryFramework: 'CDP', dueDate: '2024-07-31' },
      { userId: 2, reportType: 'Scope 3 Assessment', period: 'FY 2023', totalEmissions: 3200, totalOffsets: 1000, netEmissions: 2200, complianceStatus: 'pending_review', regulatoryFramework: 'GHG Protocol', dueDate: '2024-06-30' },
      { userId: 5, reportType: 'Quarterly Disclosure', period: 'Q2 2024', totalEmissions: 2100, totalOffsets: 1800, netEmissions: 300, complianceStatus: 'pending_review', regulatoryFramework: 'SEC Climate', dueDate: '2024-07-31' },
      { userId: 1, reportType: 'CSRD Report', period: 'FY 2023', totalEmissions: 5200, totalOffsets: 4800, netEmissions: 400, complianceStatus: 'compliant', regulatoryFramework: 'EU CSRD', dueDate: '2024-06-30' },
      { userId: 2, reportType: 'SBTi Progress', period: '2023', totalEmissions: 4550, totalOffsets: 3200, netEmissions: 1350, complianceStatus: 'compliant', regulatoryFramework: 'SBTi', dueDate: '2024-12-31' },
      { userId: 5, reportType: 'ISO 14064 Verification', period: 'FY 2023', totalEmissions: 8500, totalOffsets: 6000, netEmissions: 2500, complianceStatus: 'non_compliant', regulatoryFramework: 'ISO 14064', dueDate: '2024-05-31' },
      { userId: 1, reportType: 'CORSIA Report', period: '2023', totalEmissions: 1200, totalOffsets: 1200, netEmissions: 0, complianceStatus: 'compliant', regulatoryFramework: 'ICAO CORSIA', dueDate: '2024-04-30' },
      { userId: 2, reportType: 'Annual Carbon Report', period: 'FY 2023', totalEmissions: 4550, totalOffsets: 3200, netEmissions: 1350, complianceStatus: 'compliant', regulatoryFramework: 'UK ETS', dueDate: '2024-03-31' },
      { userId: 5, reportType: 'Voluntary Offset Report', period: 'Q1 2024', totalEmissions: 2100, totalOffsets: 900, netEmissions: 1200, complianceStatus: 'non_compliant', regulatoryFramework: 'ICROA', dueDate: '2024-04-30' },
      { userId: 1, reportType: 'Net Zero Progress', period: '2023', totalEmissions: 5200, totalOffsets: 4800, netEmissions: 400, complianceStatus: 'compliant', regulatoryFramework: 'Race to Zero', dueDate: '2024-12-31' },
      { userId: 2, reportType: 'Supply Chain Carbon', period: 'FY 2023', totalEmissions: 2800, totalOffsets: 800, netEmissions: 2000, complianceStatus: 'pending_review', regulatoryFramework: 'CDP Supply Chain', dueDate: '2024-08-31' },
      { userId: 5, reportType: 'SECR Report', period: 'FY 2023', totalEmissions: 8500, totalOffsets: 6000, netEmissions: 2500, complianceStatus: 'non_compliant', regulatoryFramework: 'UK SECR', dueDate: '2024-03-31' },
    ]);
    console.log('Compliance Reports seeded');

    // Audit Logs (15+)
    await AuditLog.bulkCreate([
      { userId: 1, action: 'LOGIN', entityType: 'User', entityId: 1, details: 'User logged in successfully', ipAddress: '192.168.1.100', timestamp: '2024-06-01T09:00:00Z' },
      { userId: 2, action: 'CREATE_CREDIT', entityType: 'CarbonCredit', entityId: 1, details: 'Listed new carbon credit: Amazon Reforestation VCS-2024', ipAddress: '10.0.0.50', timestamp: '2024-06-01T10:15:00Z' },
      { userId: 3, action: 'VERIFY_CREDIT', entityType: 'Verification', entityId: 1, details: 'Approved verification for credit #1', ipAddress: '172.16.0.25', timestamp: '2024-06-01T11:30:00Z' },
      { userId: 5, action: 'BUY_CREDIT', entityType: 'Transaction', entityId: 1, details: 'Purchased 500 tons from Amazon Reforestation', ipAddress: '192.168.2.200', timestamp: '2024-06-01T14:00:00Z' },
      { userId: 1, action: 'RETIRE_CREDIT', entityType: 'Retirement', entityId: 1, details: 'Retired 100 credits for annual commitment', ipAddress: '192.168.1.100', timestamp: '2024-06-02T09:30:00Z' },
      { userId: 2, action: 'UPDATE_CREDIT', entityType: 'CarbonCredit', entityId: 3, details: 'Updated price for Kenya Cookstove Project', ipAddress: '10.0.0.50', timestamp: '2024-06-02T10:00:00Z' },
      { userId: 4, action: 'CREATE_PROJECT', entityType: 'Project', entityId: 1, details: 'Created new project: Amazon Green Belt Initiative', ipAddress: '10.10.0.100', timestamp: '2024-06-02T11:00:00Z' },
      { userId: 1, action: 'GENERATE_REPORT', entityType: 'ComplianceReport', entityId: 1, details: 'Generated Annual Carbon Report for FY 2023', ipAddress: '192.168.1.100', timestamp: '2024-06-03T08:00:00Z' },
      { userId: 5, action: 'TRANSFER_CREDIT', entityType: 'Transaction', entityId: 16, details: 'Transferred 1500 Vietnam rice credits', ipAddress: '192.168.2.200', timestamp: '2024-06-03T15:00:00Z' },
      { userId: 3, action: 'AI_VERIFICATION', entityType: 'Verification', entityId: 6, details: 'AI verification initiated for Congo Basin REDD+', ipAddress: '172.16.0.25', timestamp: '2024-06-04T10:00:00Z' },
      { userId: 2, action: 'LOGIN', entityType: 'User', entityId: 2, details: 'User logged in from new device', ipAddress: '10.0.0.75', timestamp: '2024-06-04T09:00:00Z' },
      { userId: 1, action: 'UPDATE_PROFILE', entityType: 'User', entityId: 1, details: 'Updated company information', ipAddress: '192.168.1.100', timestamp: '2024-06-04T16:00:00Z' },
      { userId: 4, action: 'SUBMIT_VERIFICATION', entityType: 'Verification', entityId: 11, details: 'Submitted Chile Geothermal for verification', ipAddress: '10.10.0.100', timestamp: '2024-06-05T09:00:00Z' },
      { userId: 5, action: 'AI_ANALYSIS', entityType: 'CarbonCredit', entityId: 14, details: 'AI analysis requested for Norway DAC credits', ipAddress: '192.168.2.200', timestamp: '2024-06-05T11:00:00Z' },
      { userId: 1, action: 'EXPORT_DATA', entityType: 'ComplianceReport', entityId: 4, details: 'Exported CDP Disclosure report to PDF', ipAddress: '192.168.1.100', timestamp: '2024-06-05T14:00:00Z' },
      { userId: 2, action: 'DELETE_DRAFT', entityType: 'CarbonCredit', entityId: null, details: 'Deleted draft credit listing', ipAddress: '10.0.0.50', timestamp: '2024-06-05T16:30:00Z' },
    ]);
    console.log('Audit Logs seeded');

    // Offset Recommendations (15+)
    await OffsetRecommendation.bulkCreate([
      { userId: 1, emissionAmount: 5200, estimatedCost: 78000, priority: 'high', status: 'accepted', aiAnalysis: 'Recommend a diversified portfolio: 40% nature-based, 30% renewable energy, 20% tech removal, 10% community projects.' },
      { userId: 2, emissionAmount: 4550, estimatedCost: 63700, priority: 'high', status: 'accepted', aiAnalysis: 'Focus on Gold Standard certified credits for maximum co-benefits. Prioritize cookstove and clean water projects.' },
      { userId: 5, emissionAmount: 8500, estimatedCost: 127500, priority: 'high', status: 'pending', aiAnalysis: 'Large offset need requires bulk purchasing strategy. Consider VCS REDD+ credits for cost efficiency.' },
      { userId: 1, emissionAmount: 1200, estimatedCost: 18000, priority: 'medium', status: 'accepted', aiAnalysis: 'Aviation-specific offsets recommended. CORSIA-eligible credits from renewable energy projects.' },
      { userId: 2, emissionAmount: 320, estimatedCost: 5600, priority: 'low', status: 'pending', aiAnalysis: 'Small offset need - consider premium DAC credits for maximum permanence and credibility.' },
      { userId: 5, emissionAmount: 3500, estimatedCost: 52500, priority: 'high', status: 'rejected', aiAnalysis: 'Manufacturing emissions best offset with industrial efficiency projects and renewable energy certificates.' },
      { userId: 1, emissionAmount: 890, estimatedCost: 11570, priority: 'medium', status: 'accepted', aiAnalysis: 'Office electricity best addressed through renewable energy credits matching grid consumption.' },
      { userId: 2, emissionAmount: 2100, estimatedCost: 31500, priority: 'high', status: 'pending', aiAnalysis: 'Supply chain emissions require upstream engagement plus offset strategy. Consider Scope 3 certified credits.' },
      { userId: 5, emissionAmount: 1500, estimatedCost: 22500, priority: 'medium', status: 'accepted', aiAnalysis: 'Construction emissions are one-time. Recommend permanent removal credits like biochar.' },
      { userId: 1, emissionAmount: 456, estimatedCost: 6840, priority: 'low', status: 'accepted', aiAnalysis: 'Heating emissions best offset with energy efficiency and geothermal credits.' },
      { userId: 2, emissionAmount: 890, estimatedCost: 13350, priority: 'medium', status: 'pending', aiAnalysis: 'Logistics emissions offset with transport-focused renewable energy and efficiency projects.' },
      { userId: 5, emissionAmount: 560, estimatedCost: 8400, priority: 'low', status: 'pending', aiAnalysis: 'IT equipment embodied carbon offset with tech removal and circular economy credits.' },
      { userId: 1, emissionAmount: 230, estimatedCost: 3450, priority: 'low', status: 'accepted', aiAnalysis: 'Data center emissions best matched with renewable energy certificates from same grid.' },
      { userId: 2, emissionAmount: 75, estimatedCost: 1125, priority: 'low', status: 'accepted', aiAnalysis: 'Refrigerant emissions are high-GWP. Offset with verified HFC destruction projects.' },
      { userId: 5, emissionAmount: 95, estimatedCost: 1425, priority: 'low', status: 'pending', aiAnalysis: 'Generator emissions offset with clean energy access projects in developing nations.' },
    ]);
    console.log('Offset Recommendations seeded');

    // Sustainability Reports (15+)
    await SustainabilityReport.bulkCreate([
      { userId: 1, title: 'CarbonMarket Annual Sustainability Report 2023', period: 'FY 2023', totalEmissions: 5200, reductionTarget: 15, actualReduction: 12, status: 'published', frameworks: 'GRI, TCFD, SASB' },
      { userId: 2, title: 'GreenTech ESG Performance Report', period: 'FY 2023', totalEmissions: 4550, reductionTarget: 20, actualReduction: 18, status: 'published', frameworks: 'GRI, CDP, SBTi' },
      { userId: 5, title: 'SustainCorp Carbon Neutrality Progress', period: 'FY 2023', totalEmissions: 8500, reductionTarget: 25, actualReduction: 10, status: 'draft', frameworks: 'GRI, TCFD' },
      { userId: 1, title: 'Q1 2024 Sustainability Update', period: 'Q1 2024', totalEmissions: 1300, reductionTarget: 18, actualReduction: 15, status: 'published', frameworks: 'TCFD' },
      { userId: 2, title: 'GreenTech Net Zero Roadmap', period: '2023-2030', totalEmissions: 4550, reductionTarget: 50, actualReduction: 18, status: 'published', frameworks: 'SBTi, Race to Zero' },
      { userId: 5, title: 'SustainCorp Scope 3 Assessment', period: 'FY 2023', totalEmissions: 5800, reductionTarget: 10, actualReduction: 5, status: 'draft', frameworks: 'GHG Protocol, CDP' },
      { userId: 1, title: 'Biodiversity Impact Assessment', period: 'FY 2023', totalEmissions: 5200, reductionTarget: 15, actualReduction: 12, status: 'published', frameworks: 'TNFD, GRI' },
      { userId: 2, title: 'GreenTech Social Impact Report', period: 'FY 2023', totalEmissions: 4550, reductionTarget: 20, actualReduction: 18, status: 'published', frameworks: 'GRI, UN SDGs' },
      { userId: 5, title: 'SustainCorp Water Stewardship Report', period: 'FY 2023', totalEmissions: 8500, reductionTarget: 25, actualReduction: 10, status: 'draft', frameworks: 'CDP Water, GRI' },
      { userId: 1, title: 'Climate Risk Disclosure 2023', period: 'FY 2023', totalEmissions: 5200, reductionTarget: 15, actualReduction: 12, status: 'published', frameworks: 'TCFD, CSRD' },
      { userId: 2, title: 'GreenTech Circular Economy Report', period: 'FY 2023', totalEmissions: 4550, reductionTarget: 20, actualReduction: 18, status: 'published', frameworks: 'GRI, Ellen MacArthur' },
      { userId: 5, title: 'SustainCorp Employee Sustainability Report', period: 'FY 2023', totalEmissions: 420, reductionTarget: 30, actualReduction: 15, status: 'published', frameworks: 'GRI' },
      { userId: 1, title: 'Supply Chain Sustainability Assessment', period: 'FY 2023', totalEmissions: 2100, reductionTarget: 12, actualReduction: 8, status: 'draft', frameworks: 'CDP Supply Chain, GRI' },
      { userId: 2, title: 'GreenTech Innovation & Sustainability', period: 'FY 2023', totalEmissions: 4550, reductionTarget: 20, actualReduction: 18, status: 'published', frameworks: 'GRI, SASB' },
      { userId: 5, title: 'SustainCorp Annual Integrated Report', period: 'FY 2023', totalEmissions: 8500, reductionTarget: 25, actualReduction: 10, status: 'draft', frameworks: 'IIRC, GRI, TCFD' },
    ]);
    console.log('Sustainability Reports seeded');

    console.log('\n✅ All data seeded successfully!');
    console.log('📧 Demo login: admin@carbonmarket.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
