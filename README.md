# HareMatcher

![](https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80)

Harematcher is a pet project built to let you match with the cute bunny of your dreams.


### How to run
* create `resources/secretSignKey.secret` file with content similar to `003502b3040a060108094a0b0d0dfe1f`
* `npm install --prefix frontend` to install frontend dependencies
* `./gradlew buildFrontend` to build frontend and integrate it into backend
* `./gradlew -t build &` to continuously build and hot-reload for development (run in separate terminal)
* `./gradlew run` to run


(omit `./` on Windows)

`GlobalConfig.ts` contains configs to make react frontend target the localhost dev endpoint of the backend 
to enable running both with hot reloading for development. 

### TODOs
* Make all 404s just return your index (prevents errors when directly going to URLs that are made for react router)
* Set up basic profile page (picture, basic info section, description)
  * add test accounts that get created on startup
  * add page for updating basic profile page
* Add basic matching page (see profile, allow selecting Match or Skip)
* Add actual matching (two profiles matched each other, displayed on "your matches" page, can unmatch)
* Add chat for matches
* Add filtering for matches (looking for bunnies of specific size, age, fluffiness etc)

### Credits
* Images from [Unsplash](https://unsplash.com)