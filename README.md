# HareMatcher

![](https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80)

Harematcher is a pet project built to let you match with the cute bunny of your dreams.

Create a profile for your bunny and let people swipe on it. Every user that likes your profile will be shown to you and
you can check their user-profile.
If you think they're a good match for your bunny, you can start a conversation by messaging them. Before that they are
not able to contact you.

This way you can find a good home for your pet quickly and easily.

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
* implement adding profile pictures & updating vaccinations
* add page for updating user page
* Add filtering for matches (looking for bunnies of specific size, age, fluffiness etc)
* Validate input: https://stackoverflow.com/questions/54204190/ktor-how-can-i-validate-json-request**
* Test-users getting deleted and re-created on restart makes session cookies invalid and requires deleting them from the
  browser - maybe fix..?
* Look into whether you should use `useCallback` for some of your function definitions inside react function components


### Credits

* Images from [Unsplash](https://unsplash.com)
* `default_user.png` from [Kiranshastry](https://www.flaticon.com/free-icons/user)
