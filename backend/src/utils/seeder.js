const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding...');
};

const seedData = async () => {
  await connectDB();
  await User.deleteMany({});
  await Election.deleteMany({});
  await Candidate.deleteMany({});

  const password = await bcrypt.hash('Password123!', 12);

  const superadmin = await User.create({
    firstName: 'Super', lastName: 'Admin', email: 'superadmin@votesecure.com',
    password: 'Password123!', role: 'superadmin', isActive: true, isVerified: true
  });

  const admin = await User.create({
    firstName: 'John', lastName: 'Admin', email: 'admin@votesecure.com',
    password: 'Password123!', role: 'admin', isActive: true, isVerified: true
  });

  const voter1 = await User.create({
    firstName: 'Alice', lastName: 'Johnson', email: 'voter1@votesecure.com',
    password: 'Password123!', role: 'voter', isActive: true, isVerified: true,
    phone: '+1-555-0101', nationalId: 'ID123456789'
  });

  const voter2 = await User.create({
    firstName: 'Bob', lastName: 'Smith', email: 'voter2@votesecure.com',
    password: 'Password123!', role: 'voter', isActive: true, isVerified: true,
    phone: '+1-555-0102', nationalId: 'ID987654321'
  });

  const observer = await User.create({
    firstName: 'Carol', lastName: 'Observer', email: 'observer@votesecure.com',
    password: 'Password123!', role: 'observer', isActive: true, isVerified: true
  });

  const election = await Election.create({
    title: '2024 General Presidential Election',
    description: 'The national presidential election to elect the next president and vice president.',
    type: 'general', status: 'active',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    region: 'National', constituency: 'All Constituencies',
    positions: [
      { name: 'President', description: 'Chief Executive of the nation', maxWinners: 1, maxVotesPerVoter: 1 },
      { name: 'Vice President', description: 'Deputy Chief Executive', maxWinners: 1, maxVotesPerVoter: 1 }
    ],
    totalEligibleVoters: 500000, totalVotesCast: 125000,
    votingMethod: 'single', isAnonymous: true, requiresVerification: true,
    observers: [observer._id], admins: [admin._id], createdBy: superadmin._id,
    rules: ['Must be a registered voter', 'One vote per position', 'Valid ID required'],
    publishResults: true
  });

  const candidates = await Candidate.insertMany([
    {
      election: election._id, position: 'President',
      firstName: 'James', lastName: 'Harrison', party: 'Democratic Alliance',
      partyColor: '#1a56db', bio: 'Experienced statesman with 20 years in public service.',
      qualifications: ['Harvard Law School', 'Former Senator', '3-term Governor'],
      manifesto: 'A better future for all citizens through economic reform and social justice.',
      ballotNumber: 1, status: 'approved', totalVotes: 68000, isIncumbent: false,
      age: 58, education: 'J.D., Harvard Law School', experience: '20 years in public office'
    },
    {
      election: election._id, position: 'President',
      firstName: 'Sarah', lastName: 'Mitchell', party: 'Republican Union',
      partyColor: '#e02424', bio: 'Business leader turned politician with a vision for economic growth.',
      qualifications: ['Wharton Business School', 'Former CEO', 'State Senator'],
      manifesto: 'Putting citizens first with lower taxes and stronger borders.',
      ballotNumber: 2, status: 'approved', totalVotes: 52000, isIncumbent: true,
      age: 54, education: 'MBA, Wharton', experience: '12 years in business and politics'
    },
    {
      election: election._id, position: 'President',
      firstName: 'Marcus', lastName: 'Green', party: 'Progressive Party',
      partyColor: '#057a55', bio: 'Environmental activist and community organizer.',
      qualifications: ['Yale University', 'Environmental Law', 'Community Leader'],
      manifesto: 'Green new deal for sustainable future and climate justice.',
      ballotNumber: 3, status: 'approved', totalVotes: 5000, isIncumbent: false,
      age: 47, education: 'B.A., Yale University', experience: '15 years as activist'
    },
    {
      election: election._id, position: 'Vice President',
      firstName: 'Linda', lastName: 'Rodriguez', party: 'Democratic Alliance',
      partyColor: '#1a56db', bio: 'Former Secretary of State with international expertise.',
      ballotNumber: 1, status: 'approved', totalVotes: 65000, isIncumbent: false, age: 52
    },
    {
      election: election._id, position: 'Vice President',
      firstName: 'David', lastName: 'Thompson', party: 'Republican Union',
      partyColor: '#e02424', bio: 'Military veteran and former state governor.',
      ballotNumber: 2, status: 'approved', totalVotes: 54000, isIncumbent: false, age: 61
    }
  ]);

  // Create a second upcoming election
  await Election.create({
    title: '2024 State Senate Elections',
    description: 'Elections for all state senate seats.',
    type: 'local', status: 'upcoming',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    region: 'State', positions: [
      { name: 'State Senator - District 1', description: 'Senate seat for District 1', maxWinners: 1, maxVotesPerVoter: 1 }
    ],
    totalEligibleVoters: 120000, totalVotesCast: 0,
    votingMethod: 'single', createdBy: superadmin._id, admins: [admin._id]
  });

  console.log('✅ Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('SuperAdmin: superadmin@votesecure.com / Password123!');
  console.log('Admin: admin@votesecure.com / Password123!');
  console.log('Voter 1: voter1@votesecure.com / Password123!');
  console.log('Voter 2: voter2@votesecure.com / Password123!');
  console.log('Observer: observer@votesecure.com / Password123!');
  
  mongoose.connection.close();
};

seedData().catch(err => { console.error(err); process.exit(1); });
