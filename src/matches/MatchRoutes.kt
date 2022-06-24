package matches

import de.odinmatthias.UserSession
import de.odinmatthias.matches.LikeOrPass
import de.odinmatthias.matches.Swipe.Companion.swipeDateTimeFormatter
import de.odinmatthias.matches.SwipeDAO
import de.odinmatthias.matches.Swipes
import de.odinmatthias.profiles.Profile
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
import org.jetbrains.exposed.sql.orWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.*


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
                        .andWhere { Swipes.swipedProfile eq null }
                        .map {
                            ProfileDAO.findById(it[Profiles.id])?.toProfile(matchable = true)
                        }
                        .firstOrNull()
                } ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(unswipedProfile)
            }

            get("matches") {
                val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                val matchesByProfiles = transaction {
                    val matchProfileDAOs =
                        (Profiles leftJoin Swipes)
                            .select { Profiles.user eq currentUser.id }
                            .andWhere { Swipes.likeOrPass eq LikeOrPass.LIKE }  // TODO: test if this really excludes PASSes
                            .orWhere { Swipes.swipedProfile eq null }
                            .map {
                                ProfileDAO.findById(it[Profiles.id])!!
                            }

                    val matchesByProfiles = matchProfileDAOs.map {
                        val matches = it.receivedSwipes.map { match ->
                            Match(
                                match.user.id.value,
                                match.user.name,
                                Base64.getEncoder().encodeToString(match.user.picture.bytes),
                                match.createdOn.format(swipeDateTimeFormatter)
                            )
                        }
                        return@map MatchesByProfile(it.toProfile(matchable = true), matches)
                    }

                    return@transaction matchesByProfiles
                }

                call.respond(matchesByProfiles)
            }

            post("swipe") {
                val swipeData = call.receive<SwipeData>()

                val userDao = call.sessions.get<UserSession>()?.getCurrentUserDAO()
                    ?: return@post call.respond(HttpStatusCode.Unauthorized)
                val profileDAO = transaction { ProfileDAO.findById(swipeData.profileId) }
                    ?: return@post call.respond(HttpStatusCode.NotFound)

                val isDuplicate = transaction {
                    userDao.givenSwipes.any { it.swipedProfile.id.value == swipeData.profileId }
                }
                if (isDuplicate) {
                    return@post call.respond(HttpStatusCode.Conflict)
                }

                transaction {
                    SwipeDAO.new {
                        user = userDao
                        swipedProfile = profileDAO
                        createdOn = LocalDateTime.now()
                        likeOrPass = swipeData.likeOrPass
                    }
                }

                call.respond(HttpStatusCode.Accepted)
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
}

fun Application.registerMatchRouting() {
    routing {
        matchRouting()
    }
}

data class Match(public val userId: Int, public val userName: String, public val userPicture: String, public val matchedOn: String)
data class MatchesByProfile(public val profile: Profile, public val matches: List<Match>)
