import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Video from '../models/Video.js';
import Quiz from '../models/Quiz.js';
import ReferralSetting from '../models/ReferralSetting.js';
import YoutubeChannel from '../models/YoutubeChannel.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    await Quiz.deleteMany({});
    await ReferralSetting.deleteMany({});
    await YoutubeChannel.deleteMany({});

    console.log('Cleared existing data...');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      mobile: '9876543210',
      password: '123456',
      role: 'admin',
      language: 'english'
    });

    // Create test users
    const testUser = await User.create({
      username: 'john_doe',
      mobile: '9876543211',
      password: '123456',
      role: 'promotor',
      language: 'english',
      earnings: {
        cash: 1500,
        grow: 2300,
        scratch: 450
      },
      trainingDay: 3
    });

    console.log('Created users...');

    // Create sample videos
    const dailyVideo = await Video.create({
      title: 'Daily Market Update - January 10, 2025',
      description: 'Today\'s market insights and promotional opportunities',
      type: 'daily',
      youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      showingDate: new Date(),
      createdBy: adminUser._id
    });

    const trainingVideos = [];
    for (let day = 1; day <= 7; day++) {
      const video = await Video.create({
        title: `Day ${day}: Training Video`,
        description: `Comprehensive training content for day ${day}`,
        type: 'training',
        youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        showingDate: new Date(),
        day,
        createdBy: adminUser._id
      });
      trainingVideos.push(video);
    }

    const promotionVideo = await Video.create({
      title: 'Morning Promotion Strategies',
      description: 'Learn effective promotion techniques for morning hours',
      type: 'promotion',
      youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      showingDate: new Date(),
      session: '12am-12pm',
      createdBy: adminUser._id
    });

    console.log('Created videos...');

    // Create sample quiz
    await Quiz.create({
      videoId: trainingVideos[0]._id,
      questions: [
        {
          questionEn: 'What is the main focus of our company?',
          questionTa: 'எங்கள் நிறுவனத்தின் முக்கிய கவனம் என்ன?',
          choices: [
            {
              textEn: 'Promotional training',
              textTa: 'விளம்பர பயிற்சி',
              isCorrect: true
            },
            {
              textEn: 'Product sales',
              textTa: 'தயாரிப்பு விற்பனை',
              isCorrect: false
            }
          ],
          timeLimit: 30
        }
      ],
      earnings: {
        promotor: 10,
        promotor1: 15,
        promotor2: 20,
        promotor3: 25,
        promotor4: 30
      },
      createdBy: adminUser._id
    });

    console.log('Created quizzes...');

    // Create referral settings
    await ReferralSetting.create([
      {
        level: 'promotor',
        ranges: [
          { from: 1, to: 5, amount: 100 },
          { from: 6, to: 10, amount: 150 },
          { from: 11, to: 20, amount: 200 }
        ]
      },
      {
        level: 'promotor1',
        ranges: [
          { from: 1, to: 5, amount: 150 },
          { from: 6, to: 10, amount: 200 },
          { from: 11, to: 20, amount: 300 }
        ]
      }
    ]);

    console.log('Created referral settings...');

    // Create YouTube channels
    await YoutubeChannel.create([
      {
        name: 'Official Starup Channel',
        url: 'https://youtube.com/@starup',
        description: 'Main company updates and training content',
        createdBy: adminUser._id
      },
      {
        name: 'Starup Success Stories',
        url: 'https://youtube.com/@starup-success',
        description: 'Real success stories from our community',
        createdBy: adminUser._id
      }
    ]);

    console.log('Created YouTube channels...');

    console.log('✅ Seed data created successfully!');
    console.log('Admin credentials: username: admin, password: 123456');
    console.log('Test user credentials: username: john_doe, password: 123456');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();