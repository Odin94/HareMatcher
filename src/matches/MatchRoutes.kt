package matches

import com.google.gson.Gson
import de.odinmatthias.PictureUtils
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
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import users.User
import users.UserDAO
import java.time.LocalDateTime

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
                            .andWhere { (Swipes.likeOrPass eq LikeOrPass.LIKE) or (Swipes.swipedProfile eq null) }  // TODO: test if this really excludes PASSes
                            .map {
                                ProfileDAO.findById(it[Profiles.id])!!
                            }

                    val matchesByProfiles = matchProfileDAOs.map {
                        val matches = it.receivedSwipes.map { match ->
                            Match(
                                match.user.id.value,
                                match.swipedProfile.id.value,
                                match.user.name,
                                PictureUtils.base64Encode(match.user.picture.bytes, match.user.pictureFormat),
                                match.createdOn.format(swipeDateTimeFormatter)
                            )
                        }
                        return@map MatchesByProfile(it.toProfile(matchable = true), matches)
                    }

                    return@transaction matchesByProfiles
                }

                call.respond(matchesByProfiles)
            }

            get("/chatRooms") {
                val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                // TODO: test that this works correctly
                val chatRooms = transaction {
                    ChatMessages
                        .select { ChatMessages.targetUser eq currentUser.id }
                        .orderBy(ChatMessages.sentOn, SortOrder.DESC)
                        .groupBy(ChatMessages.sourceUser, ChatMessages.profileInQuestion)
                        .map { ChatMessageDAO.findById(it[ChatMessages.id])!! }
                        .map { ChatRoom(it.sourceUser.toUser(), it.profileInQuestion.toProfile(), -1, it.toChatMessage().sentOn) }
                }

                call.respond(chatRooms)
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

            get("/chatHistory/{userId}/{profileId}") {
                val chatPartnerId = call.parameters["userId"]?.toInt() ?: return@get call.respondText(
                    "Missing or malformed userId",
                    status = HttpStatusCode.BadRequest
                )
                val profileId = call.parameters["profileId"]?.toInt() ?: return@get call.respondText(
                    "Missing or malformed profileId",
                    status = HttpStatusCode.BadRequest
                )
                val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                val chatHistory = transaction {
                    ChatMessages
                        .select { ChatMessages.profileInQuestion eq profileId }
                        .andWhere {
                            (ChatMessages.sourceUser eq currentUser.id and (ChatMessages.targetUser eq chatPartnerId)) or
                                    (ChatMessages.sourceUser eq chatPartnerId and (ChatMessages.targetUser eq currentUser.id))
                        }
                        .orderBy(ChatMessages.sentOn, SortOrder.ASC)
                        .map { ChatMessageDAO.findById(it[ChatMessages.id])?.toChatMessage() }
                }

                call.respond(chatHistory)
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
                        val newChatMessageOrError = transaction {
                            val targetUserDAO = UserDAO.findById(incomingChatMessage.targetUserId)
                                ?: return@transaction ChatErrorCause.TargetUserNotFound
                            val profileInQuestionDAO = ProfileDAO.findById(incomingChatMessage.profileInQuestionId)
                                ?: return@transaction ChatErrorCause.ProfileInQuestionNotFound

                            return@transaction ChatMessageDAO.new {
                                message = incomingChatMessage.message
                                sourceUser = currentUserDao
                                targetUser = targetUserDAO
                                profileInQuestion = profileInQuestionDAO
                                sentOn = messageTimestamp
                            }.toChatMessage()
                        }

                        if (newChatMessageOrError is ChatErrorCause) {
                            val chatError = ChatError("${incomingChatMessage.targetUserId}", incomingChatMessage.uuid, newChatMessageOrError)
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
}

data class ChatRoom(val user: User, val profile: Profile, val messageCount: Int, val lastMessageOn: String)

data class IncomingChatMessage(val message: String, val targetUserId: Int, val profileInQuestionId: Int, val uuid: String)

data class OutgoingChatMessage(val message: String, val sourceUserId: Int, val sentOn: String) {
    fun toJson(): String = Gson().toJson(this)
}

enum class ChatErrorCause {
    TargetUserNotFound,
    ProfileInQuestionNotFound,
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

data class Match(val userId: Int, val profileId: Int, val userName: String, val userPicture: String, val matchedOn: String)
data class MatchesByProfile(val profile: Profile, val matches: List<Match>)
