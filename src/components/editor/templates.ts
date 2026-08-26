// ponytail: scaffolds, not prose. Pre-written lines read as generic/AI-written and
// people paste them verbatim. Prompts in italics get deleted as they're answered.
export const SPEECH_TEMPLATES = [
    {
        id: 'wedding',
        label: 'Wedding speech',
        content: `
<h2>Wedding speech for [couple]</h2>

<h3>Who you are · ~30 sec</h3>
<p><em>Say your name and how you know them. One sentence. Then say the thing you're most sure of about this couple — that's your opening line.</em></p>

<h3>The story · ~90 sec</h3>
<p><em>One story, told properly. Not a highlight reel. Pick the moment you'd tell a friend over dinner: where you were, what was said, why it stuck with you. If it needs a setup sentence, give it one.</em></p>

<h3>What the story shows · ~45 sec</h3>
<p><em>Now say out loud what that story proves about them — the thing everyone in the room recognises but hasn't put into words.</em></p>

<h3>To the partner · ~30 sec</h3>
<p><em>Speak directly to the one you know less well. What changed in your friend since they arrived? Be specific; this is the line people remember.</em></p>

<h3>Toast · ~20 sec</h3>
<p><em>Ask people to raise their glasses. One wish for them, then their names. Stop there — don't add a second ending.</em></p>
`
    },
    {
        id: 'celebration',
        label: 'Birthday or celebration toast',
        content: `
<h2>A toast to [name]</h2>

<h3>Why we're here · ~20 sec</h3>
<p><em>Name the occasion and your connection to them. Short. Everyone is still finding their glass.</em></p>

<h3>Who they are · ~60 sec</h3>
<p><em>One quality, not a list. The one their close friends would nod at. Say it plainly, then prove it with something they actually did.</em></p>

<h3>The story · ~60 sec</h3>
<p><em>One moment that shows that quality in action. Small is fine — the tea they made, the call they took, the thing they never mentioned again.</em></p>

<h3>Toast · ~20 sec</h3>
<p><em>What you hope for their year ahead, then their name. Glasses up.</em></p>
`
    },
    {
        id: 'eulogy',
        label: 'Eulogy',
        content: `
<h2>In memory of [name]</h2>

<h3>Who you are · ~30 sec</h3>
<p><em>Your name and what they were to you. It's allowed to be brief, and it's allowed to be hard to say.</em></p>

<h3>Who they were · ~90 sec</h3>
<p><em>Not a biography. The way they moved through a room, the phrase they always used, what they did without being asked. Two or three things you're certain of.</em></p>

<h3>The story · ~90 sec</h3>
<p><em>One memory, told slowly. The quiet ones carry further than the dramatic ones. Let it breathe — you don't have to explain it.</em></p>

<h3>What we carry forward · ~45 sec</h3>
<p><em>What of them stays with the people in this room, and what you intend to do with it.</em></p>

<h3>Close · ~20 sec</h3>
<p><em>Thank them. Say goodbye in your own words. Short is stronger here.</em></p>
`
    }
]
