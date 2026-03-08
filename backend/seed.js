/**
 * AnonTruth Database Seed Script
 * Creates test users, confessions, votes, reactions, and comments
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Confession = require('./models/Confession');
const Comment = require('./models/Comment');
const Vote = require('./models/Vote');
const Notification = require('./models/Notification');

// ─── Test Data ───
const testUsers = [
  { email: 'shadow@test.com', password: 'test1234', anonymousName: 'ShadowWalker42' },
  { email: 'phantom@test.com', password: 'test1234', anonymousName: 'PhantomVoice99' },
  { email: 'ghost@test.com', password: 'test1234', anonymousName: 'GhostWhisper77' },
  { email: 'cipher@test.com', password: 'test1234', anonymousName: 'CipherMind23' },
  { email: 'void@test.com', password: 'test1234', anonymousName: 'VoidSpeaker55' },
  { email: 'echo@test.com', password: 'test1234', anonymousName: 'EchoTruth88' },
  { email: 'dark@test.com', password: 'test1234', anonymousName: 'DarkConfessor11' },
  { email: 'neon@test.com', password: 'test1234', anonymousName: 'NeonSecret66' },
  { email: 'raven@test.com', password: 'test1234', anonymousName: 'RavenTruth33' },
  { email: 'storm@test.com', password: 'test1234', anonymousName: 'StormConfess44' },
];

const confessionTexts = [
  { text: "I once pretended to be sick for an entire week just to avoid a presentation at work. My boss sent me flowers and a get-well card. The guilt was worse than any actual flu.", category: 'work' },
  { text: "I've been secretly learning to play piano for 2 years. Nobody knows. I practice at midnight when everyone's asleep. Last week I finally played Moonlight Sonata without mistakes and cried.", category: 'random' },
  { text: "My best friend thinks I introduced her to her husband at a party by coincidence. I actually stalked his social media for weeks and engineered the entire meeting because I knew they'd be perfect together.", category: 'relationship' },
  { text: "I'm a teacher and I accidentally gave the wrong student the 'Most Improved' award at graduation. The real winner's parents were in the audience. I never corrected it. That was 5 years ago.", category: 'school' },
  { text: "Every Sunday I tell my family I'm going to church. I actually go to a café alone, read books, and eat croissants for 3 hours. It's the only peace I get all week.", category: 'funny' },
  { text: "I found $500 on the street last month. I kept it and told nobody. I used it to pay for my mom's medication she couldn't afford. I still don't know if that makes it right.", category: 'random' },
  { text: "I've been writing anonymous love letters to my neighbor for a year. She thinks she has a secret admirer. I'm too scared to tell her it's me because she once said I'm 'like a brother' to her.", category: 'relationship' },
  { text: "My coworkers think I'm a genius because I always solve problems fast. The truth? I faced the exact same issues at my last job. I'm not smart, I'm just experienced in failing.", category: 'work' },
  { text: "I dropped out of college 3 years ago but my parents still think I'm studying. I've been working two jobs to save money. I plan to tell them when I can afford to start my own business.", category: 'school' },
  { text: "I accidentally liked my ex's photo from 2019 while stalking their profile at 3 AM. I unliked it immediately but I KNOW they got the notification. I've been avoiding eye contact ever since.", category: 'funny' },
  { text: "I witnessed something terrible at work and reported it anonymously. The company launched an investigation and the person was fired. Nobody knows it was me. I still have nightmares about what I saw.", category: 'work' },
  { text: "I tell everyone I'm an introvert but the truth is I'm desperately lonely. I've memorized the conversation patterns of TV characters just to seem normal when I talk to people.", category: 'random' },
  { text: "I've been secretly saving every birthday card anyone has ever given me since I was 6 years old. I have 127 cards in a box under my bed. Some are from people who are no longer alive. I read them when I'm sad.", category: 'random' },
  { text: "My 'homemade' pasta sauce that everyone raves about at family dinners? It's store-bought. I've been transferring it to my own jar for 8 years. My grandmother would disown me if she knew.", category: 'funny' },
  { text: "I created a fake LinkedIn profile with impressive credentials just to see what kinds of job offers I'd get. I got offered a six-figure salary within a week. It made me realize how broken the hiring system is.", category: 'work' },
  { text: "I've been going to therapy for 2 years and telling my therapist everything EXCEPT the one thing I actually need to talk about. I'm paying someone to help me and I can't even be honest with them.", category: 'random' },
  { text: "I secretly adopted a stray cat and have been hiding it in my apartment for 6 months. My landlord has a strict no-pets policy. His name is Professor Whiskers and he's my best friend.", category: 'funny' },
  { text: "I cheated on exactly one test in high school — the final exam in AP Chemistry. I got a 98%. That grade got me into my dream college. My entire career is built on a lie.", category: 'school' },
  { text: "I pretend I don't know how to cook so my partner always makes dinner. I actually learned from Gordon Ramsay's entire YouTube channel. I make gourmet meals when they're not home and eat alone like a king.", category: 'relationship' },
  { text: "I run one of the largest anonymous meme accounts on Instagram with 2M followers. My coworkers share my memes in our group chat and I have to pretend I'm seeing them for the first time.", category: 'random' },
];

const commentTexts = [
  "This hit different. Thanks for sharing.",
  "Honestly? Same. You're not alone in this.",
  "The fact that you're even confessing shows growth 💯",
  "I can't believe this. Wild story.",
  "This is why I love this app. Real humans, real stories.",
  "Plot twist of the century right here.",
  "You need to tell them eventually. Trust me on this.",
  "I literally screamed reading this 😂😂",
  "This is either the funniest or saddest thing I've read today",
  "Been there. It gets better, I promise.",
  "Okay but WHY is this so relatable",
  "The guilt will eat you alive. Speak your truth.",
  "Professor Whiskers deserves the world 🐱",
  "This is the most wholesome confession ever",
  "I'm not crying, you're crying 😭",
  "The audacity. I respect it though.",
  "Someone give this person a hug",
  "This reads like a movie plot honestly",
  "Your secret is safe with us ✊",
  "Life is too short for regrets. Own it!",
];

// Sample Unsplash image URLs (free to use)
const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // ── 1. Create Users ──
    console.log('\n👥 Creating users...');
    const users = [];
    for (const u of testUsers) {
      let existing = await User.findOne({ email: u.email });
      if (existing) {
        users.push(existing);
        console.log(`   ↳ ${u.anonymousName} (already exists)`);
      } else {
        const user = new User(u);
        await user.save();
        users.push(user);
        console.log(`   ↳ ${u.anonymousName} ✅`);
      }
    }

    // ── 2. Create Confessions ──
    console.log('\n📝 Creating confessions...');
    const confessions = [];
    for (let i = 0; i < confessionTexts.length; i++) {
      const author = users[i % users.length];
      const c = confessionTexts[i];
      const hasImage = i % 3 === 0; // Every 3rd post gets an image
      
      // Randomize creation time across last 7 days
      const daysAgo = Math.random() * 7;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const confession = new Confession({
        text: c.text,
        category: c.category,
        userId: author._id,
        image: hasImage ? sampleImages[i % sampleImages.length] : null,
        createdAt,
        trueVotes: 0,
        fakeVotes: 0,
        reactions: { funny: 0, shocking: 0, sad: 0, crazy: 0 },
      });
      await confession.save();
      confessions.push(confession);
      console.log(`   ↳ #${i + 1} by ${author.anonymousName} ${hasImage ? '📷' : '📝'} [${c.category}]`);
    }

    // ── 3. Add Votes ──
    console.log('\n🗳️  Adding votes...');
    let voteCount = 0;
    for (const confession of confessions) {
      // Each confession gets votes from random users
      const numVoters = randInt(2, 8);
      const shuffled = [...users].sort(() => Math.random() - 0.5).slice(0, numVoters);
      
      for (const voter of shuffled) {
        if (voter._id.toString() === confession.userId.toString()) continue;
        
        const existing = await Vote.findOne({ userId: voter._id, confessionId: confession._id });
        if (existing) continue;

        const voteType = Math.random() > 0.35 ? 'true' : 'fake'; // 65% true, 35% fake
        const vote = new Vote({ userId: voter._id, confessionId: confession._id, voteType });
        await vote.save();

        if (voteType === 'true') confession.trueVotes += 1;
        else confession.fakeVotes += 1;
        voteCount++;
      }
      await confession.save();
    }
    console.log(`   ↳ ${voteCount} votes added ✅`);

    // ── 4. Add Reactions ──
    console.log('\n🎭 Adding reactions...');
    const reactionTypes = ['funny', 'shocking', 'sad', 'crazy'];
    for (const confession of confessions) {
      const numReactions = randInt(1, 12);
      for (let i = 0; i < numReactions; i++) {
        const rType = rand(reactionTypes);
        confession.reactions[rType] += 1;
      }
      await confession.save();
    }
    console.log(`   ↳ Reactions distributed across all confessions ✅`);

    // ── 5. Add Comments ──
    console.log('\n💬 Adding comments...');
    let commentCount = 0;
    for (const confession of confessions) {
      const numComments = randInt(1, 5);
      for (let i = 0; i < numComments; i++) {
        const commenter = rand(users.filter(u => u._id.toString() !== confession.userId.toString()));
        if (!commenter) continue;

        const comment = new Comment({
          confessionId: confession._id,
          userId: commenter._id,
          text: rand(commentTexts),
          createdAt: new Date(confession.createdAt.getTime() + randInt(1, 48) * 3600000),
        });
        await comment.save();
        commentCount++;
      }
    }
    console.log(`   ↳ ${commentCount} comments added ✅`);

    // ── 6. Make some posts extra controversial (50/50 vote split) ──
    console.log('\n⚡ Making some posts controversial...');
    const controversialPosts = confessions.slice(3, 6);
    for (const c of controversialPosts) {
      c.trueVotes = randInt(15, 25);
      c.fakeVotes = c.trueVotes + randInt(-2, 2); // Very close split
      await c.save();
      console.log(`   ↳ #${confessions.indexOf(c) + 1}: ${c.trueVotes}T / ${c.fakeVotes}F`);
    }

    // ── 7. Make some posts "top" performers ──
    console.log('\n🏆 Boosting top performers...');
    const topPosts = confessions.slice(0, 3);
    for (const c of topPosts) {
      c.trueVotes = randInt(30, 60);
      c.fakeVotes = randInt(5, 15);
      c.reactions.funny = randInt(10, 30);
      c.reactions.shocking = randInt(5, 20);
      c.reactions.sad = randInt(3, 10);
      c.reactions.crazy = randInt(5, 15);
      await c.save();
      console.log(`   ↳ #${confessions.indexOf(c) + 1}: ${c.trueVotes + c.fakeVotes} votes, ${c.reactions.funny + c.reactions.shocking + c.reactions.sad + c.reactions.crazy} reactions`);
    }

    // ── Summary ──
    console.log('\n═══════════════════════════════════════');
    console.log('✅ SEED COMPLETE');
    console.log(`   👥 ${users.length} users`);
    console.log(`   📝 ${confessions.length} confessions (${confessions.filter(c => c.image).length} with images)`);
    console.log(`   🗳️  ${voteCount} votes`);
    console.log(`   💬 ${commentCount} comments`);
    console.log(`   ⚡ ${controversialPosts.length} controversial posts`);
    console.log(`   🏆 ${topPosts.length} top performers`);
    console.log('═══════════════════════════════════════');
    console.log('\n🔑 All test accounts use password: test1234');
    console.log('   Login with any email like shadow@test.com\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
