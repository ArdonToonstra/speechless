/**
 * Question templates for each occasion type.
 * Each occasion has 3 templates with different focuses.
 * Use {speechReceiverName} placeholder for personalization.
 */

export interface QuestionTemplate {
    id: string
    name: string
    description: string
    questions: { text: string }[]
}

export interface OccasionTemplates {
    [occasionType: string]: QuestionTemplate[]
}

export const questionTemplates: OccasionTemplates = {
    wedding: [
        {
            id: 'wedding-memories',
            name: 'Relationship Memories',
            description: 'Focus on the couple\'s journey together',
            questions: [
                { text: 'What is your favorite memory of {speechReceiverName} as a couple?' },
                { text: 'When did you first realize {speechReceiverName} had found "the one"?' },
                { text: 'What makes {speechReceiverName}\'s relationship special to you?' },
                { text: 'Share a funny or heartwarming moment you witnessed between them.' },
            ],
        },
        {
            id: 'wedding-wishes',
            name: 'Wishes & Advice',
            description: 'Marriage advice and well-wishes',
            questions: [
                { text: 'What advice would you give {speechReceiverName} for a happy marriage?' },
                { text: 'What do you wish for {speechReceiverName} in their future together?' },
                { text: 'Describe {speechReceiverName} in three words.' },
                { text: 'What makes you excited about their future?' },
            ],
        },
        {
            id: 'wedding-stories',
            name: 'Love Stories',
            description: 'The story of how they met and fell in love',
            questions: [
                { text: 'Do you know how {speechReceiverName} met? Share the story!' },
                { text: 'What moment made you know they were meant for each other?' },
                { text: 'Share a story that shows how much {speechReceiverName} loves each other.' },
                { text: 'What will you remember most about their relationship?' },
            ],
        },
    ],

    birthday: [
        {
            id: 'birthday-memories',
            name: 'Celebration Memories',
            description: 'Birthday and celebration moments',
            questions: [
                { text: 'What is your favorite memory of celebrating with {speechReceiverName}?' },
                { text: 'Share a funny story about {speechReceiverName}.' },
                { text: 'What do you admire most about {speechReceiverName}?' },
                { text: 'Describe a moment when {speechReceiverName} made you laugh.' },
            ],
        },
        {
            id: 'birthday-milestones',
            name: 'Life Milestones',
            description: 'Achievements and growth',
            questions: [
                { text: 'What achievement of {speechReceiverName} are you most proud of?' },
                { text: 'How has {speechReceiverName} grown or changed over the years?' },
                { text: 'Share a challenge {speechReceiverName} overcame that inspired you.' },
                { text: 'What lesson have you learned from {speechReceiverName}?' },
            ],
        },
        {
            id: 'birthday-wishes',
            name: 'Birthday Wishes',
            description: 'Wishes for the year ahead',
            questions: [
                { text: 'What do you wish for {speechReceiverName} in the coming year?' },
                { text: 'If you could give {speechReceiverName} any gift, what would it be and why?' },
                { text: 'What makes {speechReceiverName} special to you?' },
                { text: 'Share a message you want {speechReceiverName} to hear.' },
            ],
        },
    ],

    funeral: [
        {
            id: 'funeral-memories',
            name: 'Cherished Memories',
            description: 'Honoring their life and legacy',
            questions: [
                { text: 'What is your most treasured memory of {speechReceiverName}?' },
                { text: 'How did {speechReceiverName} make a difference in your life?' },
                { text: 'Share a moment that captures who {speechReceiverName} truly was.' },
                { text: 'What will you miss most about {speechReceiverName}?' },
            ],
        },
        {
            id: 'funeral-legacy',
            name: 'Their Legacy',
            description: 'The impact they had on others',
            questions: [
                { text: 'What lesson did {speechReceiverName} teach you?' },
                { text: 'How would you describe {speechReceiverName} to someone who never met them?' },
                { text: 'What values or qualities did {speechReceiverName} embody?' },
                { text: 'Share a story that shows the kind of person {speechReceiverName} was.' },
            ],
        },
        {
            id: 'funeral-comfort',
            name: 'Words of Comfort',
            description: 'Messages of love and remembrance',
            questions: [
                { text: 'What would you like to say to {speechReceiverName} one last time?' },
                { text: 'How do you want to remember {speechReceiverName}?' },
                { text: 'Share a happy memory that makes you smile when you think of them.' },
                { text: 'What part of {speechReceiverName} will live on in you?' },
            ],
        },
    ],

    retirement: [
        {
            id: 'retirement-career',
            name: 'Career Highlights',
            description: 'Professional achievements and memories',
            questions: [
                { text: 'What is your favorite work memory with {speechReceiverName}?' },
                { text: 'What professional achievement of {speechReceiverName} impressed you most?' },
                { text: 'Share a story about {speechReceiverName}\'s dedication or work ethic.' },
                { text: 'How did {speechReceiverName} impact the team or workplace?' },
            ],
        },
        {
            id: 'retirement-colleague',
            name: 'The Colleague',
            description: 'Working together and team moments',
            questions: [
                { text: 'What made {speechReceiverName} a great colleague?' },
                { text: 'Share a funny office story involving {speechReceiverName}.' },
                { text: 'What will the workplace miss most without {speechReceiverName}?' },
                { text: 'Describe {speechReceiverName}\'s working style in a few words.' },
            ],
        },
        {
            id: 'retirement-future',
            name: 'Future Wishes',
            description: 'Wishes for retirement',
            questions: [
                { text: 'What do you wish for {speechReceiverName} in retirement?' },
                { text: 'What advice would you give {speechReceiverName} for this new chapter?' },
                { text: 'What hobby or activity do you hope {speechReceiverName} pursues?' },
                { text: 'Share your favorite thing about {speechReceiverName} as a person.' },
            ],
        },
    ],

    roast: [
        {
            id: 'roast-embarrassing',
            name: 'Embarrassing Moments',
            description: 'The funny and cringeworthy',
            questions: [
                { text: 'What\'s the most embarrassing story you know about {speechReceiverName}?' },
                { text: 'Share a time {speechReceiverName} completely failed at something.' },
                { text: 'What annoying habit does {speechReceiverName} have?' },
                { text: 'Describe {speechReceiverName}\'s fashion sense... honestly.' },
            ],
        },
        {
            id: 'roast-quirks',
            name: 'Quirks & Habits',
            description: 'Their lovable (and not so lovable) traits',
            questions: [
                { text: 'What\'s {speechReceiverName}\'s weirdest habit or quirk?' },
                { text: 'If {speechReceiverName} were an animal, what would they be and why?' },
                { text: 'What\'s something {speechReceiverName} thinks they\'re good at but really isn\'t?' },
                { text: 'Share a time {speechReceiverName} said something they\'d regret.' },
            ],
        },
        {
            id: 'roast-lovable',
            name: 'Lovably Roastable',
            description: 'Jokes with heart',
            questions: [
                { text: 'What would {speechReceiverName}\'s dating profile say if they were honest?' },
                { text: 'What\'s {speechReceiverName}\'s biggest "old person" quality?' },
                { text: 'If Hollywood made a movie about {speechReceiverName}, what would it be called?' },
                { text: 'Despite everything, why do you actually love {speechReceiverName}?' },
            ],
        },
    ],

    surprise: [
        {
            id: 'surprise-keeping',
            name: 'Keeping the Secret',
            description: 'How you kept the surprise',
            questions: [
                { text: 'How difficult has it been to keep this surprise from {speechReceiverName}?' },
                { text: 'Share a close call when {speechReceiverName} almost found out!' },
                { text: 'What\'s the funniest excuse you had to make to hide the surprise?' },
                { text: 'Why does {speechReceiverName} deserve this surprise?' },
            ],
        },
        {
            id: 'surprise-reaction',
            name: 'Anticipating the Reaction',
            description: 'What you expect and hope for',
            questions: [
                { text: 'How do you think {speechReceiverName} will react to this surprise?' },
                { text: 'What moment are you most excited to witness?' },
                { text: 'What makes this surprise so meaningful for {speechReceiverName}?' },
                { text: 'Share why {speechReceiverName} means so much to you.' },
            ],
        },
        {
            id: 'surprise-messages',
            name: 'Heartfelt Messages',
            description: 'What you want them to know',
            questions: [
                { text: 'What do you want {speechReceiverName} to feel when they discover this?' },
                { text: 'Share a memory that shows why {speechReceiverName} is loved.' },
                { text: 'What message do you want to give {speechReceiverName}?' },
                { text: 'Why is {speechReceiverName} so special to you?' },
            ],
        },
    ],

    other: [
        {
            id: 'other-memories',
            name: 'Favorite Memories',
            description: 'Meaningful moments',
            questions: [
                { text: 'What is your favorite memory with {speechReceiverName}?' },
                { text: 'Share a moment that defines who {speechReceiverName} is.' },
                { text: 'What makes {speechReceiverName} unique?' },
                { text: 'Describe a time {speechReceiverName} surprised you.' },
            ],
        },
        {
            id: 'other-qualities',
            name: 'Wonderful Qualities',
            description: 'What makes them special',
            questions: [
                { text: 'What do you admire most about {speechReceiverName}?' },
                { text: 'Describe {speechReceiverName} in three words.' },
                { text: 'What lesson have you learned from {speechReceiverName}?' },
                { text: 'How has {speechReceiverName} impacted your life?' },
            ],
        },
        {
            id: 'other-wishes',
            name: 'Wishes & Messages',
            description: 'Your heartfelt words',
            questions: [
                { text: 'What do you wish for {speechReceiverName}?' },
                { text: 'Share a message you want {speechReceiverName} to hear.' },
                { text: 'Why are you grateful for {speechReceiverName}?' },
                { text: 'What will you always remember about {speechReceiverName}?' },
            ],
        },
    ],
}

/**
 * Get templates for a specific occasion type
 */
export function getTemplatesForOccasion(occasionType: string): QuestionTemplate[] {
    return questionTemplates[occasionType] || questionTemplates.other
}
