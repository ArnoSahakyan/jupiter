// The demo network: students at one university, their posts and chats.
// Times are relative to when the seed runs ("2 hours ago"), so it always looks recent.

const PEOPLE = [
  { key: 'ani', fname: 'Ani Petrosyan', job: 'Astronomy student', status: 'online', joined: 62,
    look: { bg: ['#c9b8ff', '#8f6cf0'], skin: '#f1c7a5', hair: '#3b2416', hairStyle: 'long', shirt: '#6D3FD6' },
    cover: ['planet', { sky: ['#120a2e', '#3b1f7a'], planet: ['#f3d9a4', '#e0a868', '#c9884f', '#F5A524'], seed: 3 }] },
  { key: 'leo', fname: 'Leo Martins', job: 'Computer Science student', status: 'online', joined: 58,
    look: { bg: ['#ffd9a8', '#f5a524'], skin: '#8d5a3b', hair: '#1d1410', hairStyle: 'curly', shirt: '#2f4858', glasses: true },
    cover: ['city', { sky: ['#170c30', '#5B2FC2'], buildings: ['#23173f', '#2d1d52', '#1b1233'], seed: 5 }] },
  { key: 'sara', fname: 'Sara Kim', job: 'Physics student', status: 'away', joined: 55,
    look: { bg: ['#bfe9df', '#4fb6a0'], skin: '#f3d2b3', hair: '#1b1b22', hairStyle: 'bun', shirt: '#d6336c' },
    cover: ['sea', { sky: ['#0d1b3d', '#4a3a8f'], water: ['#1b2a5e', '#0a1230'], seed: 11 }] },
  { key: 'david', fname: 'David Grigoryan', job: 'Mathematics student', status: 'offline', joined: 50,
    look: { bg: ['#cfe0ff', '#5b8def'], skin: '#e9c09c', hair: '#2a1a12', hairStyle: 'short', shirt: '#373b3f' },
    cover: ['mountains', { sky: ['#2a1b5c', '#b7609b', '#ffb58a'], hills: ['#5b3a8c', '#3c2566', '#22163f'], seed: 7 }] },
  { key: 'maya', fname: 'Maya Johnson', job: 'Biology student', status: 'online', joined: 47,
    look: { bg: ['#ffd1dc', '#f07ca0'], skin: '#6e4630', hair: '#140d0a', hairStyle: 'curly', shirt: '#2f9e44' },
    cover: ['mountains', { sky: ['#123b3a', '#3fa58f', '#f8e3a1'], hills: ['#1f6f5c', '#165448', '#0e3b33'], seed: 21 }] },
  { key: 'omar', fname: 'Omar Haddad', job: 'Architecture student', status: 'away', joined: 40,
    look: { bg: ['#e2d9ff', '#9b7bea'], skin: '#c58f66', hair: '#1a1210', hairStyle: 'short', shirt: '#F5A524', glasses: true },
    cover: ['city', { sky: ['#0f1a3a', '#3a5bbf'], buildings: ['#14203f', '#1b2a52', '#0d1630'], seed: 13 }] },
  { key: 'nina', fname: 'Nina Volkova', job: 'Graphic Design student', status: 'online', joined: 21,
    look: { bg: ['#ffe3c2', '#ff9f6b'], skin: '#f6d6c0', hair: '#b5532a', hairStyle: 'long', shirt: '#2b2233' },
    cover: ['sea', { sky: ['#3a1450', '#e0679a'], water: ['#3b1d5e', '#140a26'], seed: 17 }] },
  { key: 'tom', fname: 'Tom Becker', job: 'Physics teaching assistant', status: 'offline', joined: 70,
    look: { bg: ['#d8f0c8', '#7fba00'], skin: '#f0c8a8', hair: '#8a5a2b', hairStyle: 'short', shirt: '#5B2FC2' },
    cover: ['planet', { sky: ['#06141f', '#1d4e5f'], planet: ['#cfe3f0', '#9cc2d9', '#6f9fbf', '#e9f3f8'], seed: 19 }] },
  { key: 'lucy', fname: 'Lucy Chen', job: 'Economics student', status: 'online', joined: 12,
    look: { bg: ['#d6f3ff', '#4ab3e0'], skin: '#f4d4b5', hair: '#16110f', hairStyle: 'bun', shirt: '#8259E0' },
    cover: ['mountains', { sky: ['#1a2350', '#6d7bd6', '#c9d4ff'], hills: ['#3d4a8c', '#2a3570', '#1a2250'], seed: 23 }] },
  { key: 'hana', fname: 'Hana Sato', job: 'Chemistry student', status: 'online', joined: 33,
    look: { bg: ['#ffe6f0', '#f28bb5'], skin: '#f6d9c2', hair: '#221a18', hairStyle: 'long', shirt: '#4ab3e0' },
    cover: ['sea', { sky: ['#14284d', '#6a8fd6'], water: ['#1f3a6b', '#0b1830'], seed: 29 }] },
  { key: 'karen', fname: 'Karen Avetisyan', job: 'Philosophy student', status: 'away', joined: 27,
    look: { bg: ['#fff1c4', '#f5c524'], skin: '#efc9a6', hair: '#4a2a18', hairStyle: 'bun', shirt: '#5B2FC2', glasses: true },
    cover: ['mountains', { sky: ['#3b1d5e', '#d27a6b', '#ffd38a'], hills: ['#6b3a5e', '#4a2645', '#2a1530'], seed: 31 }] },
  { key: 'ben', fname: 'Ben Okafor', job: 'Mechanical Engineering student', status: 'offline', joined: 18,
    look: { bg: ['#d9f2e6', '#3fa58f'], skin: '#5c3a26', hair: '#120c09', hairStyle: 'short', shirt: '#F5A524' },
    cover: ['city', { sky: ['#0b1a2c', '#2f6f8f'], buildings: ['#11263a', '#173048', '#0a1826'], seed: 37 }] },
];

// friendships (one row per pair)
const FRIENDS = [
  ['ani', 'leo'], ['ani', 'sara'], ['ani', 'david'], ['ani', 'maya'], ['ani', 'omar'],
  ['leo', 'sara'], ['leo', 'david'], ['leo', 'omar'], ['sara', 'tom'], ['sara', 'maya'],
  ['david', 'tom'], ['maya', 'nina'], ['omar', 'nina'], ['lucy', 'leo'],
  ['hana', 'sara'], ['hana', 'maya'], ['karen', 'david'], ['karen', 'omar'], ['ben', 'leo'], ['ben', 'omar'], ['ben', 'david'],
];

// pending requests: [sender, receiver]
const REQUESTS = [['nina', 'ani'], ['tom', 'ani'], ['ani', 'lucy']];

const POST_PICTURES = {
  jupiter: ['planet', { sky: ['#0b0620', '#2d1766'], planet: ['#f3d9a4', '#e0a868', '#c9884f', '#F5A524'], seed: 41 }],
  hike: ['mountains', { sky: ['#2a1b5c', '#c46a8e', '#ffc58a'], hills: ['#6a3f8f', '#46286b', '#26163f'], seed: 43 }],
  beach: ['sea', { sky: ['#101a40', '#5a4a9f'], water: ['#1e2c62', '#0a1230'], seed: 47 }],
  campus: ['city', { sky: ['#140a2c', '#6D3FD6'], buildings: ['#22163d', '#2c1c4f', '#1a1130'], seed: 53 }],
  meteors: ['sea', { sky: ['#0a0f2e', '#3a2a7f'], water: ['#16245a', '#070d26'], seed: 61 }],
  sunset: ['mountains', { sky: ['#3b1d5e', '#e0679a', '#ffd38a'], hills: ['#7a3a6e', '#552850', '#311733'], seed: 59 }],
};

// hoursAgo: when it was posted. likes: who liked it.
// comments: [author, text, hoursAgo, replies?: [[author, text, hoursAgo]]]
const POSTS = [
  { by: 'ani', hoursAgo: 3, picture: 'jupiter', likes: ['leo', 'sara', 'maya', 'omar', 'david'],
    content: 'Clear skies tonight, so the astronomy club got the big telescope out. Jupiter and three of its moons, live! 🪐',
    comments: [
      ['leo', 'This is unreal. Saving a spot for next time!', 2.5, [['ani', 'Thursday, 9pm on the roof of the science building', 2.2]]],
      ['sara', 'Io, Europa and Ganymede? Callisto must have been hiding behind it.', 2],
    ] },
  { by: 'leo', hoursAgo: 6, likes: ['ani', 'omar'],
    content: 'Finally fixed the bug that kept our group project from building. It was a missing semicolon. Three hours. One semicolon.',
    comments: [['omar', 'Classic. Coffee is on me tomorrow', 5]] },
  { by: 'maya', hoursAgo: 9, picture: 'hike', likes: ['ani', 'sara', 'nina'],
    content: 'Field trip for the ecology course: we counted 14 bird species before lunch. Also the view was okay I guess 🏔️',
    comments: [['nina', 'Okay?? This could be a poster', 8]] },
  { by: 'david', hoursAgo: 14, likes: ['leo', 'tom'],
    content: 'Study group for the linear algebra midterm, Wednesday 6pm in the library, room 204. Bring questions, I will bring snacks.',
    comments: [['ani', "I'm in. Eigenvalues still scare me", 13, [['david', 'We will make them less scary, promise', 12]]]] },
  { by: 'omar', hoursAgo: 22, picture: 'campus', likes: ['ani', 'leo', 'nina', 'lucy'],
    content: 'Late night in the studio, but the model for the new library design is finally done. The campus looks better at night anyway.',
    comments: [['lucy', 'Can we visit the exhibition when it opens?', 20]] },
  { by: 'sara', hoursAgo: 28, likes: ['tom', 'ani'],
    content: 'Our lab measured the speed of sound today and got within 2% of the real value. Feeling like a real physicist for once.',
    comments: [['tom', 'Within 2% is great work. Write up the error analysis carefully!', 26]] },
  { by: 'nina', hoursAgo: 40, picture: 'sunset', likes: ['maya', 'omar'],
    content: 'Color study for my design portfolio: sunsets, but every one in violet. Which palette do you like more?',
    comments: [] },
  { by: 'ani', hoursAgo: 52, picture: 'meteors', likes: ['maya', 'david', 'leo'],
    content: 'Reminder that the Leonid meteor shower peaks this week. Best after midnight, away from the city lights. Who wants to carpool?',
    comments: [['maya', 'Me! I can drive', 50], ['david', 'Count me in too', 49]] },
  { by: 'lucy', hoursAgo: 70, likes: ['leo'],
    content: 'First week at Jupiter. Looking for people to join an economics reading group, we start with "Thinking, Fast and Slow".',
    comments: [['leo', 'Welcome! Read it last year, happy to join', 68]] },
  { by: 'tom', hoursAgo: 96, likes: ['sara', 'david'],
    content: 'Office hours move to Friday 2–4pm this week. The problem set deadline stays the same.',
    comments: [] },
  { by: 'leo', hoursAgo: 120, picture: 'beach', likes: ['ani', 'sara', 'omar'],
    content: 'Weekend by the sea before exams. No laptops allowed (I brought one anyway).',
    comments: [['sara', 'Ha, of course you did', 118]] },
];

// conversations with Ani: [sender, text, minutesAgo]
const CHATS = {
  leo: [
    ['leo', 'Hey! Are you going to the telescope night on Thursday?', 900],
    ['ani', 'Of course, I am running it 😄', 895],
    ['leo', 'Perfect. Can I bring my roommate? He has never looked through a real telescope', 893],
    ['ani', 'Sure, the more the better. Bring warm clothes, the roof gets cold', 888],
    ['leo', 'Will do. Also, did you finish the stats assignment?', 120],
    ['ani', 'Almost, stuck on question 4', 118],
    ['leo', 'Same! Want to look at it together after class tomorrow?', 117],
    ['ani', 'Yes please. Library at 3?', 30],
    ['leo', 'See you there 👍', 28],
  ],
  sara: [
    ['sara', 'Do you still have the notes from Tuesday’s lecture?', 1500],
    ['ani', 'Yes, sending them in a bit', 1490],
    ['ani', 'Just uploaded them to the shared folder', 1440],
    ['sara', 'You’re a lifesaver, thank you!', 1430],
  ],
  maya: [
    ['maya', 'Meteor shower carpool: I can pick you up at 11:30', 200],
    ['ani', 'Amazing, I’ll bring hot chocolate', 190],
  ],
};

module.exports = { PEOPLE, FRIENDS, REQUESTS, POST_PICTURES, POSTS, CHATS };
