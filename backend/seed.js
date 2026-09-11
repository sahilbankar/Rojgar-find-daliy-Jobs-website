const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: './.env' });

// Load Models
const User = require('./models/User');
const Employer = require('./models/Employer');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Category = require('./models/Category');

const connectDB = require('./config/database');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing database collections...');

    await User.deleteMany();
    await Employer.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Category.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Password123!', salt);

    console.log('Creating Admin Account...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@rojgar.com',
      password,
      role: 'admin',
      phone: '9876543210',
      location: 'New Delhi, India',
    });

    console.log('Creating Categories...');
    const techCategory = await Category.create({
      name: 'Information Technology',
      slug: 'information-technology',
      icon: 'Code'
    });
    const healthCategory = await Category.create({
      name: 'Healthcare',
      slug: 'healthcare',
      icon: 'HeartPulse'
    });
    const educationCategory = await Category.create({
      name: 'Education',
      slug: 'education',
      icon: 'GraduationCap'
    });

    console.log('Creating Employer Accounts...');
    const employerUser1 = await User.create({
      name: 'TechCorp Solutions HR',
      email: 'hr@techcorp.com',
      password,
      role: 'employer',
      phone: '9876543211',
      location: 'Bangalore, Karnataka'
    });

    const employerUser2 = await User.create({
      name: 'City Hospital HR',
      email: 'careers@cityhospital.com',
      password,
      role: 'employer',
      phone: '9876543212',
      location: 'Mumbai, Maharashtra'
    });

    const employer1 = await Employer.create({
      userId: employerUser1._id,
      companyName: 'TechCorp Solutions',
      companyDescription: 'Leading software development company specializing in cloud infrastructure and enterprise applications.',
      location: 'Bangalore, Karnataka',
      website: 'https://techcorp.example.com',
      address: 'Prestige Tech Park, Bangalore',
      phone: '9876543211'
    });

    const employer2 = await Employer.create({
      userId: employerUser2._id,
      companyName: 'City Hospital',
      companyDescription: 'Top-tier medical facility providing comprehensive healthcare services and patient care.',
      location: 'Mumbai, Maharashtra',
      website: 'https://cityhospital.example.com',
      address: 'Bandra West, Mumbai',
      phone: '9876543212'
    });

    console.log('Creating Job Seekers...');
    const seeker1 = await User.create({
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      password,
      role: 'jobseeker',
      phone: '9876543213',
      location: 'Pune, Maharashtra',
      experience: '5 years',
      education: 'B.Tech in Computer Science',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
      availabilityStatus: 'Actively Looking'
    });

    const seeker2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      password,
      role: 'jobseeker',
      phone: '9876543214',
      location: 'Mumbai, Maharashtra',
      experience: '3 years',
      education: 'B.Sc in Nursing',
      skills: ['Nursing', 'Patient Care', 'CPR', 'Emergency Care'],
      availabilityStatus: 'Actively Looking'
    });

    console.log('Posting Jobs...');
    const job1 = await Job.create({
      employerId: employer1._id,
      categoryId: techCategory._id,
      companyName: 'TechCorp Solutions',
      category: 'Information Technology',
      title: 'Senior Full Stack Developer',
      description: 'Looking for an experienced MERN stack developer to lead our cloud application development team.',
      requirements: ['5+ years Node.js', 'React & TypeScript expertise', 'MongoDB experience'],
      salaryMin: 1200000,
      salaryMax: 1800000,
      salaryRange: 'Rs.12,00,000 - Rs.18,00,000 / year',
      location: 'Bangalore / Remote',
      jobType: 'Full-time',
      totalVacancies: 2,
      experience: 5,
      adminStatus: 'Approved',
      isActive: true
    });

    const job2 = await Job.create({
      employerId: employer2._id,
      categoryId: healthCategory._id,
      companyName: 'City Hospital',
      category: 'Healthcare',
      title: 'Registered Staff Nurse',
      description: 'Night shift and day shift registered nurse for multi-speciality emergency and ICU department.',
      requirements: ['Valid Nursing License', '2+ years hospital experience', 'Patient management'],
      salaryMin: 450000,
      salaryMax: 700000,
      salaryRange: 'Rs.4,50,000 - Rs.7,00,000 / year',
      location: 'Mumbai, Maharashtra',
      jobType: 'Full-time',
      totalVacancies: 4,
      experience: 2,
      adminStatus: 'Approved',
      isActive: true
    });

    console.log('Submitting Sample Applications...');
    await Application.create({
      jobId: job1._id,
      applicantId: seeker1._id,
      coverLetter: 'I have 5 years of experience in MERN stack and would love to contribute to TechCorp.',
      status: 'Under Review',
      experience: '5 years'
    });

    await Application.create({
      jobId: job2._id,
      applicantId: seeker2._id,
      coverLetter: 'I am a passionate emergency nurse looking to join the City Hospital team.',
      status: 'Shortlisted',
      experience: '3 years'
    });

    console.log('=============================================');
    console.log('Database Successfully Populated with Real Data!');
    console.log('=============================================');
    console.log('TEST ACCOUNTS (Password for all: Password123!)');
    console.log('- Admin: admin@rojgar.com');
    console.log('- Employer 1: hr@techcorp.com');
    console.log('- Employer 2: careers@cityhospital.com');
    console.log('- Job Seeker 1: michael.c@example.com');
    console.log('- Job Seeker 2: sarah.j@example.com');
    console.log('=============================================');

    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
