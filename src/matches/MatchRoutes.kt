package matches

import de.odinmatthias.UserSession
import de.odinmatthias.matches.LikeDAO
import de.odinmatthias.matches.Swipes
import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.profiles.Profiles
import de.odinmatthias.users.SwipeData
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.http.cio.websocket.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import io.ktor.websocket.*
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime


fun Route.matchRouting() {
    route("api/v1") {
        authenticate("userAuth") {
            get("discover") {
                val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                val unswipedProfile = transaction {
                    (Profiles leftJoin Swipes)
                        .selectAll()
                        .limit(1)
                        .andWhere { Profiles.user neq currentUser.id }
                        .andWhere { Swipes.likedProfile eq null }
                        .map {
                            ProfileDAO.findById(it[Profiles.id])?.toProfile(matchable = true)
                        }
                        .firstOrNull()
                } ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(unswipedProfile)
            }

            post("swipe") {
                val swipeData = call.receive<SwipeData>()

                val userDao = call.sessions.get<UserSession>()?.getCurrentUserDAO()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val profileDAO = transaction { ProfileDAO.findById(swipeData.profileId) }
                    ?: return@post call.respond(HttpStatusCode.NotFound)

                val isDuplicate = transaction {
                    userDao.givenSwipes.any { it.likedProfile.id.value == swipeData.profileId }
                }
                if (isDuplicate) {
                    return@post call.respond(HttpStatusCode.Conflict)
                }

                transaction {
                    LikeDAO.new {
                        user = userDao
                        likedProfile = profileDAO
                        createdOn = LocalDateTime.now()
                        likeOrPass = swipeData.likeOrPass
                    }
                }

                call.respond(HttpStatusCode.Accepted)
            }
        }
    }

    webSocket("/chat") {
        send("You are connected!")
        for (frame in incoming) {
            frame as? Frame.Text ?: continue
            val receivedText = frame.readText()
            send("You said: $receivedText")
        }
    }
}

fun Application.registerMatchRouting() {
    routing {
        matchRouting()
    }
}