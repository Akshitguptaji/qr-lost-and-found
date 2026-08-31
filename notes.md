agr hum sara code controllers mailikh denge toh usse fat controller bolte hai , isse dikkat ky ky hoskti hai (controllers r just act as the traffic cop , who handle errors and send the data to the service , service it is a pure ty fn . that takes raw i/p , tlak to prisma return data ,Any part of your app—a controller, a background job, or a test file—can use a Service function.):-
(agr sbah kuch controller mai likha hoga , toh hum sirf tabh hi operations perform kr payenge jabh req aayegi ,so its actuall y restrict your code)
:-maan lo tumhe kuch automated kaam kranan hai , like delete the urser that r 1 yrs old , ( but u can not perform that cause there is no req.)
1.Zero Reusability,
2.hard ot debug
3.messy code
"
and
Service(kitchen): Does the database work.
rule:it does not care that which waiter or cutomer gives the order it just prepare

Controller(The Waiter / Traffic Cop): Handles the web traffic.
Rule: The waiter never cooks the food.

Routes: Maps the URL to the Controller."

use ehernal email , for fake smtp
use resnd in sending ht maill at th etime of deployment , onlocalm/c uu canuse th enodemailer

src/
├── api/ # Think of this as your frontend "Services".
│ # ALL fetch/axios calls to your Express backend go here.
├── assets/ # Static files like your style.css and any images.
├── components/ # Small, reusable UI pieces.
│ ├── ui/ # shadcn-vue will automatically install its components here.
│ └── shared/ # Your custom reusable pieces (like a LoadingSpinner or NavBar).
├── lib/ # Helper functions. shadcn-vue will create a utils.ts here.
├── router/ # Frontend "Routes". Maps URLs to specific Views.
├── views/ # Think of these as your frontend "Controllers" (entire pages).
│ ├── public/ # E.g., FinderPage.vue, LandingPage.vue
│ └── secure/ # E.g., OwnerDashboard.vue, Login.vue
├── App.vue # The master wrapper for your whole app.
└── main.ts # The entry file that boots up Vue.

toggle btn:- 
1:- create a reactive btn using ref.
( and make it off using false)
2:- use a btn to fire an event ( click event ) to flip th evalue ( form false to true)
3:-than use this valuse in v-if ( in your html) 
