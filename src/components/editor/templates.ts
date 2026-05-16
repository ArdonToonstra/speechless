export const SPEECH_TEMPLATES = [
    {
        id: 'wedding-simple',
        label: 'Simple Wedding Speech',
        content: `
<h2>Wedding Speech for [Couple's Names]</h2>

<h3>Opening (30–60 sec · ~80 words)</h3>
<p>Good evening, everyone. For those I haven't met, I'm [Your Name] — [your relation to the couple, e.g. "the groom's older sister" or "one of the bride's oldest friends"]. I've been looking forward to this moment for a long time, and now that it's here I've completely forgotten everything I planned to say. So I'm going off-script.</p>
<p>[Couple's Names], you both look absolutely incredible tonight.</p>

<h3>About the couple (1–2 min · ~150 words)</h3>
<p>I've had a front-row seat to this relationship from the beginning — and watching these two together has been genuinely one of the great pleasures of my life. [He/She/They] makes [Partner's Name] laugh in a way I've never seen before. And [Partner's Name] brings out a side of [Name] that, honestly, I didn't know existed.</p>
<p>[Add one specific thing you've noticed about their dynamic — how they communicate, support each other, or just make ordinary moments better.]</p>

<h3>A memory (1 min · ~100 words)</h3>
<p>[Tell one specific story — it doesn't need to be dramatic. A quiet moment you witnessed, a conversation you overheard, or a time one of them went out of their way for the other. Specific details make a speech memorable.]</p>

<h3>Toast (30 sec · ~60 words)</h3>
<p>What you have is rare. Hold onto it, grow with it, and choose each other every day — especially on the days when it's harder.</p>
<p>Ladies and gentlemen, please raise your glasses. To [Couple's Names] — may your life together be full of laughter, adventure, and love. Cheers!</p>
`
    },
    {
        id: 'birthday-toast',
        label: 'Birthday Toast',
        content: `
<h2>A Speech for [Name]'s Birthday</h2>

<h3>Opening (30 sec · ~60 words)</h3>
<p>I'll be honest — I've been trying to think of the perfect thing to say about [Name], and I keep running into the same problem: there's too much. So I've had to edit myself down to the highlights. Lucky for you, [Name], I only have about three minutes.</p>

<h3>What I love about them (1 min · ~120 words)</h3>
<p>If I had to describe [Name] to someone who'd never met [him/her/them], I'd say: [one defining quality — e.g. "the kind of person who remembers everyone's coffee order and asks about your mum"]. That's not a small thing. In a world that moves fast and forgets easily, [Name] pays attention.</p>
<p>[Add another quality or trait that feels true and specific to them — something their close friends would immediately recognise.]</p>

<h3>A memory (1 min · ~100 words)</h3>
<p>[Share one moment that captures who they are. It could be funny, tender, or quietly revealing. Aim for a story your audience hasn't heard a hundred times — something that shows a side of them people might not see every day.]</p>

<h3>Wish & toast (30 sec · ~70 words)</h3>
<p>Turning [age] means something. It means [Name] has [X] years of stories, of lessons learned the hard way, of moments that shaped [him/her/them] into the person we're celebrating tonight. I hope the next chapter brings everything [he/she/they] deserves — and a few things [he/she/they] hasn't thought to ask for yet.</p>
<p>Everyone raise your glass. To [Name] — happy birthday. Cheers!</p>
`
    },
    {
        id: 'general-thank-you',
        label: 'General Thank You',
        content: `
<h2>A Few Words of Thanks</h2>

<h3>Opening (20–30 sec · ~50 words)</h3>
<p>Before we go any further, I want to take a moment — because moments like this don't happen by accident. They happen because people care enough to make them happen. And I want to make sure those people are thanked properly.</p>

<h3>Specific thanks (1 min · ~120 words)</h3>
<p>First, [Name / names of key people who made this happen]. What you did — [brief description of what they organised, gave, or contributed] — made this possible. I don't think you fully understand how much it meant, so I'm going to say it clearly: thank you.</p>
<p>[If there are other people to thank — contributors, helpers, or guests who travelled far — mention them here by name. Specific recognition lands better than a general "thanks to everyone".]</p>

<h3>Personal note (30–45 sec · ~80 words)</h3>
<p>These occasions remind me why it matters to slow down. To look around a room and really see the people in it. To say the things we often think but don't quite get around to saying. So while I have everyone here — [add a personal, honest reflection on what this moment means to you].</p>

<h3>Close (20 sec · ~40 words)</h3>
<p>Thank you all for being here. For travelling, for making the effort, for showing up. It means more than you know. Now — let's enjoy the rest of this evening together.</p>
`
    },
    {
        id: 'eulogy',
        label: 'Eulogy',
        content: `
<h2>In Loving Memory of [Name]</h2>

<h3>Opening (30–45 sec · ~80 words)</h3>
<p>We're here today because of love. Because [Name] gathered people around [him/her/them] — and those people kept coming back, year after year, because of who [he/she/they] was.</p>
<p>My name is [Your Name]. I was [your relationship — e.g. "his daughter", "her closest friend of thirty years", "their colleague and, eventually, one of their favourite people to argue with"]. I've been asked to say a few words, and I'm going to try to do [Name] justice — knowing I can't quite.</p>

<h3>Who they were (1–2 min · ~180 words)</h3>
<p>[Name] had [a quality that defined them — e.g. "a particular talent for making strangers feel like old friends"]. It wasn't something [he/she/they] thought about or performed. It was just how [he/she/they] moved through the world.</p>
<p>To some of you, [he/she/they] was a [parent / partner / colleague / mentor]. To me, [he/she/they] was [describe your specific relationship and what it gave you]. Those aren't small things. Those are the things that shape a life — yours and the ones you touch.</p>
<p>[Add one more quality or habit that people in the room will immediately recognise. Something specific to them.]</p>

<h3>A memory (1–2 min · ~150 words)</h3>
<p>[Choose one story. It doesn't have to be grand — some of the most powerful eulogies turn on a quiet moment: the way someone made tea, the advice they gave at the right time, the thing they always said. Tell it simply and let it breathe.]</p>

<h3>Legacy (45 sec · ~90 words)</h3>
<p>What [Name] leaves behind isn't a list of achievements, though there are many. It's something harder to measure and much harder to replace: the way [he/she/they] made us feel known. Cared for. Like we were worth paying attention to.</p>
<p>I've been trying to figure out what to do with that. And I think the answer is to carry it forward — to treat people the way [he/she/they] treated people.</p>

<h3>Close (20–30 sec · ~50 words)</h3>
<p>[Name], thank you. For the time we had, for what you gave us, and for the mark you left. We will not forget you.</p>
<p>Rest now. You've more than earned it.</p>
`
    },
    {
        id: 'retirement',
        label: 'Retirement Speech',
        content: `
<h2>A Toast to [Name]</h2>

<h3>Opening (30–45 sec · ~80 words)</h3>
<p>Good [morning/afternoon/evening] everyone. For those I haven't had the pleasure of meeting, I'm [Your Name] — I've worked alongside [Name] for [X years], which means I've witnessed [him/her/them] at [his/her/their] best, occasionally at [his/her/their] most stressed, and at least twice in situations I've agreed to never speak of publicly.</p>
<p>[Name] — I can't believe this day is actually here. And I say that with complete sincerity and only a little bit of jealousy.</p>

<h3>Career tribute (1–2 min · ~160 words)</h3>
<p>In [X] years at [organisation/team], [Name] [describe their role and impact in plain, human terms — not a CV summary, but what they actually did and what it meant]. That sounds simple when I say it like that. It wasn't.</p>
<p>[Share a specific example of their professional impact — a project they led, a problem they solved, or the way they handled a difficult moment. Avoid generic superlatives; the story is more powerful.]</p>

<h3>The person behind the work (1 min · ~120 words)</h3>
<p>But here's what won't show up on the farewell card: [Name] was [a quality that defined them as a colleague and person — e.g. "the person who always had time for a question, even on the worst days"]. That kind of thing is invisible until it's gone.</p>
<p>[Add one personal quality — their humour, their patience, their honesty, their way of mentoring — and a brief illustration of it.]</p>

<h3>Looking ahead (30 sec · ~60 words)</h3>
<p>[Name], what's waiting for you on the other side of this is [describe what they're heading toward — family, travel, a long-deferred project, finally reading all those books]. It suits you. I hope it's everything you've imagined, and that you'll occasionally think of us. Not too often, though — you've earned a break.</p>

<h3>Toast (20 sec · ~40 words)</h3>
<p>Everyone, please raise your glasses. To [Name] — for everything you gave, everything you built, and everything still ahead. We will miss you every single day. To [Name]!</p>
`
    },
    {
        id: 'best-man-maid-of-honor',
        label: 'Best Man / Maid of Honor',
        content: `
<h2>To [Name] — My [Best Friend / Brother / Sister]</h2>

<h3>Opening (30–45 sec · ~80 words)</h3>
<p>Good evening, everyone. For those I haven't met yet — I'm [Your Name], and I've known [Name] for [X years]. Long enough to know all the stories I absolutely should not tell tonight. I've kept a short list. I'll be using most of it.</p>
<p>[Start with one light, affectionate anecdote — a harmless running joke, an infamous habit, or a moment that everyone who knows [Name] well will immediately recognise. Keep it warm, not mean.]</p>

<h3>Who they are (1 min · ~120 words)</h3>
<p>Beyond the jokes — and there are many — [Name] is [one quality that genuinely defines them, e.g. "one of the most generous people I've ever known"]. I don't say that lightly. I've watched [him/her/them] [brief specific example: show up for someone, go out of their way, handle something with grace]. That's who [Name] is when no one's keeping score.</p>

<h3>About the couple (1 min · ~120 words)</h3>
<p>When [Name] first told me about [Partner's Name], I noticed something immediately: [he/she/they] was different. Lighter, maybe. More settled. [Name] has always known [his/her/their] own mind — but [Partner's Name] brought out something I hadn't quite seen before.</p>
<p>[Share a specific moment you witnessed between them — something that revealed their dynamic. The funnier or more revealing the better, as long as it's told with affection.]</p>

<h3>To the partner (20 sec · ~40 words)</h3>
<p>[Partner's Name] — welcome to the family, officially. We're a [describe the group honestly — "lot", "handful", "wonderfully chaotic bunch"]. You've handled us with more grace than any of us deserve, and we're genuinely glad you're here.</p>

<h3>Toast (30 sec · ~60 words)</h3>
<p>Would everyone please raise a glass? To [Name] and [Partner's Name] — may your marriage be full of the things you've already shown us: laughter, loyalty, and the ability to make each other better. We love you both. Cheers!</p>
`
    },
    {
        id: 'engagement-toast',
        label: 'Engagement Toast',
        content: `
<h2>To [Name] and [Partner's Name]</h2>

<h3>Opening (20–30 sec · ~60 words)</h3>
<p>I don't think anyone in this room is surprised. If you've ever spent time with [Name] and [Partner's Name] together, you know that this night was coming — you just didn't know when. Well. Now we know.</p>
<p>[Optional: add a one-liner about how long it took, or a knowing joke about the proposal if the story is worth telling briefly.]</p>

<h3>The couple (1–2 min · ~150 words)</h3>
<p>What I've always loved about these two is [a specific observation about their dynamic — how they communicate, what they bring out in each other, what makes them work]. It's not always the obvious things that tell you a couple is right for each other. It's the small ones.</p>
<p>[Share one moment — something you witnessed or that one of them told you — that captures why they work. The more specific, the better. Avoid generalities like "they just get each other"; show it instead.]</p>

<h3>Looking forward (30 sec · ~60 words)</h3>
<p>An engagement is a beginning, and this is a very good one. You've already built something worth celebrating — and the best parts are still ahead. Whatever comes next, I know you'll face it the same way you've faced everything so far: together, and better for it.</p>

<h3>Toast (20 sec · ~50 words)</h3>
<p>Please raise your glasses. To [Name] and [Partner's Name] — may your engagement be as wonderful as your relationship already is, your wedding be everything you've dreamed of, and your life together full of every good thing. Cheers!</p>
`
    },
    {
        id: 'roast',
        label: 'Roast (Humorous)',
        content: `
<h2>A Few Honest Words About [Name]</h2>

<h3>Opening joke (30 sec · ~60 words)</h3>
<p>I was asked to say a few kind words about [Name]. So: "a few kind words." That's it, I'm done. Thank you, enjoy the evening.</p>
<p>[Pause for effect, then continue.] All right, fine. I've been asked to be slightly more generous than that. Slightly. I make no promises.</p>

<h3>Roast material (1–2 min · ~150 words)</h3>
<p>[Build out your roast around one or two specific, harmless targets — a well-known habit, a recurring mistake they'd freely admit to, or a personality quirk everyone in the room has experienced. The best roast material is specific, affectionate, and clearly punching at something the subject would laugh about too.]</p>
<p>[Example rhythm: state the thing, exaggerate it for comic effect, then undercut it with warmth. "I've never met someone so [quality]. And I say that as someone who once watched [him/her/them] [specific funny example]. Remarkable, really."]</p>
<p>[Add a second beat here if you have good material — a different angle, a callback, or a story. Keep the tone playful. Anything that could genuinely land badly should come out.]</p>

<h3>Genuine tribute (45 sec · ~90 words)</h3>
<p>But in all seriousness — and I do mean this — [Name] is one of the [funniest / most generous / most loyal / most infuriating in the best way] people I know. [He/She/They] shows up. Every time. And if you've ever needed [him/her/them], you already know that.</p>
<p>[Add one genuine observation — something true and warm, said simply. After the jokes, this is where the audience exhales and the speech lands. Don't rush it.]</p>

<h3>Toast (20 sec · ~50 words)</h3>
<p>[Name], this one's for you. May your [next year / marriage / next chapter] be everything you deserve — which, given what I've just said, is actually quite a lot. Everyone raise your glass. To [Name]!</p>
`
    }
]
