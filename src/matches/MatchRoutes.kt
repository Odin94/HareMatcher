package matches

import com.google.gson.Gson
import de.odinmatthias.UserSession
import de.odinmatthias.matches.*
import de.odinmatthias.matches.Swipe.Companion.swipeDateTimeFormatter
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
import org.slf4j.LoggerFactory
import users.UserDAO
import java.time.LocalDateTime
import java.util.*

private val logger = LoggerFactory.getLogger("MatchRouting")

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

        val chatConnectionsByUserIds = mutableMapOf<Int, ChatConnection>()
        webSocket("/chat") {
            val currentUserDao = call.sessions.get<UserSession>()?.getCurrentUserDAO()
                ?: return@webSocket close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, "Unauthorized"))
            chatConnectionsByUserIds[currentUserDao.id.value] = ChatConnection(this, currentUserDao)

            suspend fun sendChatError(chatError: ChatError) {
                chatConnectionsByUserIds[currentUserDao.id.value]?.session?.send(chatError.toJson())
            }

            try {
                for (frame in incoming) {
                    frame as? Frame.Text ?: continue
                    val receivedText = frame.readText()

                    val incomingChatMessage: IncomingChatMessage = Gson().fromJson(receivedText, IncomingChatMessage::class.java)
                    val messageTimestamp = LocalDateTime.now()
                    val newChatMessage = transaction {
                        val targetUserDAO = UserDAO.findById(incomingChatMessage.targetUserId)
                            ?: return@transaction null

                        return@transaction ChatMessageDAO.new {
                            message = incomingChatMessage.message
                            sourceUser = currentUserDao
                            targetUser = targetUserDAO
                            sentOn = messageTimestamp
                        }.toChatMessage()
                    }

                    if (newChatMessage == null) {
                        val chatError = ChatError("${incomingChatMessage.targetUserId}", incomingChatMessage.uuid, ChatErrorCause.TargetUserNotFound)
                        sendChatError(chatError)
                        continue
                    }

                    chatConnectionsByUserIds[incomingChatMessage.targetUserId]?.let {
                        val outgoingChatMessage = OutgoingChatMessage(
                            incomingChatMessage.message,
                            currentUserDao.id.value,
                            messageTimestamp.format(ChatMessage.chatMessageDateTimeFormatter)
                        )
                        it.session.send(outgoingChatMessage.toJson())
                    }
                }
            } catch (e: Exception) {
                logger.error("Error in chat from user $currentUserDao", e)
            } finally {
                println("Removing connection for user $currentUserDao")
                chatConnectionsByUserIds.remove(currentUserDao.id.value)
            }
        }
    }
}

data class IncomingChatMessage(val message: String, val targetUserId: Int, val uuid: String)

data class OutgoingChatMessage(val message: String, val sourceUserId: Int, val sentOn: String) {
    fun toJson(): String = Gson().toJson(this)
}

enum class ChatErrorCause {
    TargetUserNotFound,

}

data class ChatError(val errorMessage: String, val messageUuid: String, val cause: ChatErrorCause) {
    fun toJson(): String = Gson().toJson(this)
}

class ChatConnection(val session: DefaultWebSocketSession, val user: UserDAO)


fun Application.registerMatchRouting() {
    routing {
        matchRouting()
    }
}

data class Match(public val userId: Int, public val userName: String, public val userPicture: String, public val matchedOn: String)
data class MatchesByProfile(public val profile: Profile, public val matches: List<Match>)
