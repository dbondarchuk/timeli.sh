import { BlogPost } from "../models";

export const blogPostsListFixtures: BlogPost[] = [
  {
    _id: "1",
    title: "10 Tips for Better Time Management",
    slug: "blog-post-1",
    isPublished: true,
    publicationDate: new Date("2025-01-12"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Managing your time effectively is one of the most important skills you can develop. Whether you're juggling work, family, or personal projects, good time management can help you achieve more and reduce stress.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Here are some key strategies that can help you get started:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Plan your day the night before" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Set clear priorities for your tasks" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Break large projects into smaller steps" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "To implement these strategies effectively, follow these steps:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Start by identifying your most important goals" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [
          { text: "Create a daily schedule that reflects your priorities" },
        ],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Review and adjust your plan regularly" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [
          {
            text: "Remember, the journey of a thousand miles begins with a single step. Start implementing these tips today!",
          },
        ],
      },
    ],
    tags: ["Productivity", "Lifestyle"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
  {
    _id: "2",
    title: "Healthy Morning Routines That Actually Work",
    slug: "blog-post-2",
    isPublished: true,
    publicationDate: new Date("2025-01-11"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Starting your day with a solid routine can set the tone for everything that follows. A good morning routine doesn't have to be complicated—it just needs to work for you.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Here are some simple principles that can transform your mornings:",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Wake up at the same time every day, even on weekends. This helps regulate your body's internal clock and makes waking up easier over time.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "There are several key elements that make a morning routine effective:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Hydration first thing in the morning" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Light exercise or stretching" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "A few minutes of quiet reflection or meditation" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "Remember, the best routine is one you can stick to consistently. Start small and build from there.",
          },
        ],
      },
    ],
    tags: ["Health", "Wellness"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-11"),
    updatedAt: new Date("2025-01-11"),
  },
  {
    _id: "3",
    title: "Simple Home Organization Tips",
    slug: "blog-post-3",
    isPublished: true,
    publicationDate: new Date("2025-01-10"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "A well-organized home can reduce stress and make daily life more enjoyable. You don't need a complete overhaul—small, consistent changes can make a big difference.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "The key to successful organization is having a system that works for your lifestyle:",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Start with one room or area at a time. Trying to organize everything at once can be overwhelming and lead to giving up.",
          },
        ],
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "A place for everything, and everything in its place. This simple principle can transform your home.",
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Key benefits of an organized space include less time spent looking for things, reduced stress, and a more peaceful environment.",
          },
        ],
      },
    ],
    tags: ["Home", "Lifestyle"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    _id: "4",
    title: "Budget-Friendly Meal Planning Ideas",
    slug: "blog-post-4",
    isPublished: true,
    publicationDate: new Date("2025-01-09"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Meal planning is one of the best ways to save money and eat healthier. With a little preparation, you can reduce food waste and avoid expensive last-minute takeout.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Break down your meal planning into manageable steps:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Plan meals around what's on sale" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Cook in batches for multiple meals" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          { text: "Use versatile ingredients that work in multiple dishes" },
        ],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "To get started with meal planning, follow these steps:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Choose recipes for the week ahead" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Make a shopping list based on your meal plan" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Prep ingredients in advance when possible" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [
          {
            text: "Remember: meal planning gets easier with practice. Start with planning just a few days at a time!",
          },
        ],
      },
    ],
    tags: ["Cooking", "Budget"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-09"),
    updatedAt: new Date("2025-01-09"),
  },
  {
    _id: "5",
    title: "How to Start a Reading Habit",
    slug: "blog-post-5",
    isPublished: true,
    publicationDate: new Date("2025-01-08"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Reading regularly can expand your knowledge, reduce stress, and improve your focus. If you want to read more but struggle to find the time, these tips can help you build a sustainable reading habit.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Start with books that genuinely interest you. Don't feel pressured to read what others think you should—choose topics and genres that excite you.",
          },
        ],
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Key strategies for building a reading habit include setting aside dedicated time each day, carrying a book with you, and joining a book club or reading community for accountability.",
          },
        ],
      },
    ],
    tags: ["Reading", "Self-Improvement"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    _id: "6",
    title: "Easy Ways to Stay Active at Home",
    slug: "blog-post-6",
    isPublished: true,
    publicationDate: new Date("2025-01-07"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "You don't need a gym membership or expensive equipment to stay active. There are plenty of effective exercises you can do right at home with minimal or no equipment.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Start with simple bodyweight exercises that you can do anywhere:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Bodyweight squats and lunges" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Push-ups and planks" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Yoga or stretching routines" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "The key is consistency. Even 15-20 minutes of daily movement can make a significant difference in your health and energy levels.",
          },
        ],
      },
    ],
    tags: ["Fitness", "Health"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-07"),
    updatedAt: new Date("2025-01-07"),
  },
  {
    _id: "7",
    title: "Travel Planning on a Budget",
    slug: "blog-post-7",
    isPublished: true,
    publicationDate: new Date("2025-01-06"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Traveling doesn't have to break the bank. With careful planning and some smart strategies, you can explore new places without spending a fortune.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Start by researching your destination thoroughly. Look for free activities, local markets, and affordable dining options.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "To plan a budget-friendly trip, follow these steps:",
          },
        ],
      },
      {
        type: "p",
        children: [
          { text: "Set a realistic budget before you start planning" },
        ],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Book flights and accommodations in advance" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [
          { text: "Look for package deals and travel during off-peak seasons" },
        ],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "Travel is the only thing you buy that makes you richer. Plan wisely and you can see the world without emptying your wallet.",
              },
            ],
          },
        ],
      },
    ],
    tags: ["Travel", "Budget"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-06"),
    updatedAt: new Date("2025-01-06"),
  },
  {
    _id: "8",
    title: "Building Better Relationships",
    slug: "blog-post-8",
    isPublished: true,
    publicationDate: new Date("2025-01-05"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Strong relationships are the foundation of a happy and fulfilling life. Whether with family, friends, or colleagues, investing in relationships pays dividends in the long run.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Here are some fundamental principles for building better connections:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Practice active listening" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Show genuine interest in others" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Be reliable and keep your commitments" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "Remember that good relationships require effort from both sides. Communication, respect, and understanding are key to maintaining strong bonds.",
          },
        ],
      },
    ],
    tags: ["Relationships", "Personal Growth"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    _id: "9",
    title: "Mindfulness and Stress Relief",
    slug: "blog-post-9",
    isPublished: true,
    publicationDate: new Date("2025-01-04"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "In our fast-paced world, stress has become a common part of daily life. Learning to manage stress effectively is crucial for both mental and physical health.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Mindfulness practices can help you stay grounded and reduce anxiety. Here are some effective techniques:",
          },
        ],
      },
      {
        type: "p",
        children: [
          { text: "Start with just five minutes of daily meditation" },
        ],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [
          { text: "Practice deep breathing exercises throughout the day" },
        ],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Take regular breaks to check in with yourself" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "The present moment is the only time over which we have dominion. Practice being fully present.",
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Remember that stress management is a skill that improves with practice. Be patient with yourself as you develop these habits.",
          },
        ],
      },
    ],
    tags: ["Wellness", "Mental Health"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-04"),
    updatedAt: new Date("2025-01-04"),
  },
  {
    _id: "10",
    title: "Gardening Tips for Beginners",
    slug: "blog-post-10",
    isPublished: true,
    publicationDate: new Date("2025-01-03"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Starting a garden can be a rewarding hobby that brings beauty to your space and fresh produce to your table. You don't need a green thumb to get started—just some basic knowledge and patience.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Here are essential practices for successful gardening:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Start with easy-to-grow plants" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          { text: "Choose the right location with adequate sunlight" },
        ],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Water consistently but don't overwater" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "Remember that every gardener learns through experience. Don't be discouraged by setbacks—they're part of the learning process.",
          },
        ],
      },
    ],
    tags: ["Gardening", "Hobbies"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-03"),
    updatedAt: new Date("2025-01-03"),
  },
  {
    _id: "11",
    title: "Creative Hobbies to Try This Year",
    slug: "blog-post-11",
    isPublished: true,
    publicationDate: new Date("2025-01-02"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Exploring creative hobbies can bring joy, reduce stress, and help you discover new talents. Whether you're looking for a new pastime or want to rekindle an old interest, there's something for everyone.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Creative activities provide numerous benefits:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Improved mental well-being and stress relief" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Enhanced problem-solving skills" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "A sense of accomplishment and pride" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [
          {
            text: "To get started with a new hobby, follow these steps:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Choose something that genuinely interests you" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Start with basic supplies and simple projects" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Set aside regular time to practice" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "p",
        children: [{ text: "Don't be afraid to make mistakes and learn" }],
        indent: 1,
        listStyleType: "decimal",
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "Creativity is intelligence having fun. Find what brings you joy and make time for it regularly.",
              },
            ],
          },
        ],
      },
    ],
    tags: ["Hobbies", "Creativity"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-02"),
  },
  {
    _id: "12",
    title: "Sustainable Living Made Simple",
    slug: "blog-post-12",
    isPublished: true,
    publicationDate: new Date("2025-01-01"),
    content: [
      {
        type: "p",
        children: [
          {
            text: "Living sustainably doesn't have to be complicated or expensive. Small changes in your daily habits can make a significant impact on the environment and often save you money too.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Sustainable living means making choices that reduce your environmental footprint while maintaining a good quality of life.",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Here are some key benefits of sustainable practices:",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Reduced waste and lower costs" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "Better health through cleaner choices" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "p",
        children: [{ text: "A sense of contribution to something larger" }],
        indent: 1,
        listStyleType: "disc",
      },
      {
        type: "blockquote",
        children: [
          {
            type: "p",
            children: [
              {
                text: "We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly.",
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "Start with simple swaps like using reusable bags, reducing single-use plastics, and being mindful of energy consumption. Every small action counts.",
          },
        ],
      },
    ],
    tags: ["Sustainability", "Environment"],
    companyId: "1",
    appId: "1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
];
