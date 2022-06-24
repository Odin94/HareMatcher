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
* add page for updating profile page
* Add chat for matches
* Fix images not loading in lightbox when clicking until re-render is triggered
* Add filtering for matches (looking for bunnies of specific size, age, fluffiness etc)
* Validate input: https://stackoverflow.com/questions/54204190/ktor-how-can-i-validate-json-request**
* Test-users getting deleted and re-created on restart makes session cookies invalid and requires deleting them from the
  browser - maybe fix..?

### Credits
* Images from [Unsplash](https://unsplash.com)