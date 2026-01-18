# Features 

* User login and authentication
  - OAuth integration with Google for easy sign-in.
* Email services using Mailjet 
  - For account verification, password resets, and invitations.
  - Invites functionality to allow users to invite others.
  - Receive notifications and updates

* Tweetalig, Nederlands eerst
* Desktop first, later mobile optimalisatie. Module vragen en input wel mobile first/friendly maken.
* Save in between functionality.
* Feedback button to report issues or suggest features.

* Home page, login + signup flows + process flow to indicate how the product works.

* Onboarding flow
  - Type: Speech als cadeau of speech voor de gelegenheid
    - Speech als cadeau flow:
        - Occasion: wedding, retirement, funeral, birthday, roast, surprise, other (text input)
        - Datum van de gelegenheid wanneer bekend, of skip of checkbox voor hulp van een datumprikker.
        - Titel van speech, en de naam van de persoon voor wie de speech is en context voor dit event, om teamleden mee uit te nodigen. Notie dat dit gebruikt wordt om de groep uit te nodigen. 
        - Optionele extra praktische context, stad/locatie, aantal genodigen gebruik om de locatie te filteren.
    - Speech voor gelegenheid:
        - Occasion: zie boven.
        - Datum van de gelegenheid wanneer bekend
        - Titel van speech, en de naam van de persoon voor wie de speech is + context voor dit event, om teamleden mee uit te nodigen. Notie dat dit gebruikt wordt om de groep uit te nodigen.

* Dashboard met overzichten van projeten/toeast/speeches
 - weergegeven als cards met relevante info
    - naam van de speech/toast
    - datum van de gelegenheid
    - status (in progress, completed, delivered)
    - aantal teamleden
 - account settings pagina
 - log out
 - quick invite button to get the project magic link to invite others

* Project page for each speech/toast
  - Overview tab
    - Basic info: title, occasion, date, honoree name
    - Steps to complete the speech creation process / the process flow
  - Collaboration tab
    - Team members list with role based access (owner, speech-editor, collaborator)
    - Team owner can manage roles, delete members and invites
    - Invite new members via email or magic link
    - V2.0 speech giver selector - rad fortuin style selector for who will give the speech
  - Input gathering questionnaire tab
    - Structured questions to gather memories, anecdotes, and stories about the honoreer, prefilled with 3 examples per occoasion type. Option to edit or add more questions.
    - Add estimated time to complete the questionnaire
    - V2.0 Deadline setting for team members to submit their answers
    - V2.0 add reminder option
    - Magic link pus email option. 

  - Questionnaire anwsers tab
    - Two views, total list view of anwsers and per question maybe bundled like and nicely visual presented to get a nice mood board feeling. Should be able to open anwsers in tab.
    - User should be able to edit their anwsers after submission. Mood board depends on lenght of the answers.
    - v2.0 Voting system to upvote the best answers from team members, what needs to be included. 
    - v2.0 Canvas to organize and group answers into themes or sections for the speech

  - Speech editor tab
    - rich text editor met basis functionaliteiten (bold, italic, underline, headers, bullet points, etc)
    - easy access to the input answers to incorporate into the speech.
    - template suggestions based on occasion type + questionnaire question 
    - links to content library for examples and tips
    - commentaar functionaliteit voor feedback van teamleden.
    - word count and estimated read aloud time
    - PDF export functie speciaal gestyled voor het voorlezen van speeches.
    - V1.5 Advanced: hemingwayapp achtige integratie voor leesbaarheid, voor review (geen AI suggesties)
    - v2.0 commenting and feedback system
    - v2.0 version history and rollback
    - v2.0 meerdere gebruikers kunnen samenwerken aan dezelfde speech tegelijkertijd.

  - Date poll tab
    - Project owner can set up a date poll
    - Interface for team members to vote on proposed dates
    - Display of results and selected date

 - Location
    - For now we will not be in between but offer a google maps api integration a filter pre-setted on occasion type and number of guests.
    - We keep track of all the locations that have been selected. 
    - In the app the selected location will be shown in the overview tab, and on the dashboar project card. 
    - Option to select a custom location. 

    - v2.0 we will add curated locations handpicked by us and will make those first class citizin, while decrading the google maps option to a fallback.

 - Invites
    - Main user flow is to use this as a present idea, but it should also be possible to use for other types and occasions.
    - Customize invite message, we have set a default message based on the input given so far but user can edit it.
    - Option send Golden ticket and silver tickets for guests by post.
    - List down physical address to send invites.
    - Minimal 5 days before the event the invites need to be sent out.
    - if this is selected, system admin notification to prepare and send invites.

* Account settings
    - Wijzigen van wachtwoord
    - Profiel informatie aanpassen (naam, profielfoto)
    - Account verwijderen 
    - Data kunnen downloaden (GDPR compliance)

* Content libary
    - voorbeelden hoe een goede speech is opgebouwd
    - templates voor verschillende soorten speeches
    - do's and dont's


## Future ideas
* future ideas, reuse quesitonnaire response moodboard for present poster/book something..
* Need to validate the location selected. Potential to monetize the location service by taking a commission on bookings.