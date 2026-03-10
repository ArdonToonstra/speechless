# User Flow — Toast

```mermaid
flowchart TD
    A["Visit Toast"] --> B["Sign up"]
    B --> C["Verify email"]
    C --> D["Dashboard"]
    D --> E["Start a new speech— pick occasion & honoree —"]

    E --> F{What kindof speech?}

    F -->|"Giving the speechat an event"| G1["Occasion speech"]
    F -->|"Speech asa gift"| G2["Gift speech"]

    G1 --> H1{Do you knowthe date?}
    H1 -->|"Yes"| I1["Pick the date"]
    H1 -->|"Not yet"| I2["Vote on a datewith collaborators"]
    I1 --> J["Project overview"]
    I2 --> J

    G2 --> H2["Add city & guest count"]
    H2 --> H3{Do you know the date?}
    H3 -->|"Yes"| I3["Pick the date"]
    H3 -->|"Not yet"| I4["Vote on a datewith collaborators"]
    I3 --> K["Pick a location"]
    I4 --> K
    K --> J

    J --> L["Send questionnaire to friends & familyCollect stories and memories"]
    L --> M["Read the responses"]
    M --> N["Write the speechin the editor"]

    J --> O["Invite collaboratorsto help write together"]
    O --> N

    N --> P{Speech type?}

    P -->|"Occasion speech"| Q["Share the finished speechwith a public link"]
    P -->|"Gift speech"| R["Give the recipienta golden ticket"]
```

## The happy path

### Occasion speech — giving a speech at an event
1. **Sign up** and verify your email
2. **Start a speech** — pick the occasion, the honoree, and whether you know the date yet
3. **Set the date** — pick it directly, or use the date voting tool with collaborators
4. **Gather material** — send a questionnaire link to friends and family (no account needed)
5. **Read the responses** — see everything that came in, in one place
6. **Write together** — invite collaborators to help edit the speech in the shared editor
7. **Share it** — when ready, share the speech via a public read-only link

### Gift speech — speech as a present
1. **Sign up** and verify your email
2. **Start a speech** — pick the occasion, the honoree, city, and expected guest count
3. **Set the date** — pick it directly, or vote on one with collaborators
4. **Pick a location** — add a venue for the occasion
5. **Gather material** — send a questionnaire to friends and family
6. **Read the responses** and **write together** with collaborators
7. **Give a golden ticket** — hand the recipient a surprise ticket revealing the speech
