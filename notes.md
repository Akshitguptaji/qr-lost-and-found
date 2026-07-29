agr hum sara code controllers mailikh denge toh usse fat controller bolte hai , isse dikkat ky ky hoskti hai (controllers r just act as the traffic cop , who handle errors and send the data to the service , service it is a pure ty fn . that takes raw i/p , tlak to prisma return data ,Any part of your app—a controller, a background job, or a test file—can use a Service function.):-
(agr sbah kuch controller mai likha hoga , toh hum sirf tabh hi operations perform kr payenge jabh req aayegi ,so its actuall y restrict your code)
:-maan lo tumhe kuch automated kaam kranan hai , like delete the urser that r 1 yrs old , ( but u can not perform that cause there is no req.)
1.Zero Reusability,
2.hard ot debug
3.messy code
"
Service(kitchen): Does the database work.
rule:it does not care that which waiter or cutomer gives the order it just prepare

Controller(The Waiter / Traffic Cop): Handles the web traffic.
Rule: The waiter never cooks the food.

Routes: Maps the URL to the Controller."
