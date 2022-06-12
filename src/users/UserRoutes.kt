package de.odinmatthias.users

import de.odinmatthias.UserSession
import de.odinmatthias.chat.LikeDAO
import de.odinmatthias.chat.LikeOrPass
import de.odinmatthias.profiles.ProfileDAO
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import users.UserDAO
import users.Users
import java.time.LocalDateTime


fun Route.userRouting() {
    route("api/v1") {
        authenticate("userAuth") {
            route("/login") {
                post {
                    call.respond(HttpStatusCode.OK)
                }
            }

            post("/logout") {
                call.sessions.clear<UserSession>()
                call.respond(HttpStatusCode.OK)
            }
        }

        route("/users") {
            get {
                val foundUsers = transaction { UserDAO.all().map { it.toUser() } }
                call.respond(foundUsers)
            }

            get("{id}") {
                val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                    "Missing or malformed id",
                    status = HttpStatusCode.BadRequest
                )

                val user = transaction { return@transaction UserDAO.findById(id)?.toUser() }
                    ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(user)
            }

            authenticate("userAuth") {
                get("me") {
                    val user = call.sessions.get<UserSession>()?.getCurrentUser()
                        ?: return@get call.respond(HttpStatusCode.Unauthorized)

                    call.respond(user)
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

                delete("{id}") {
                    val session = call.sessions.get<UserSession>()!!
                    val id = call.parameters["id"]?.toInt() ?: return@delete call.respond(HttpStatusCode.BadRequest)
                    val user = transaction { return@transaction UserDAO.findById(id) }

                    if (user?.email != session.email) {
                        return@delete call.respond(HttpStatusCode.BadRequest)
                    }

                    val deletedItemsCount = transaction { return@transaction Users.deleteWhere { Users.id eq id } }
                    if (deletedItemsCount == 1) {
                        call.respondText("User with id $id removed correctly", status = HttpStatusCode.Accepted)
                    } else {
                        call.respond(HttpStatusCode.NotFound)
                    }
                }
            }

            post {
                val signupData = call.receive<SignupData>()

                val newUser = transaction {
                    val userDAO = UserDAO.new {
                        this.name = signupData.name
                        this.email = signupData.email
                        this.hashedPassword = BCrypt.hashpw(signupData.password, BCrypt.gensalt()).toByteArray()
                    }
                    return@transaction userDAO.toUser()
                }

                call.respond(newUser)
            }
        }
    }
}

data class SignupData(val email: String, val password: String, val name: String)
data class SwipeData(val profileId: Int, val likeOrPass: LikeOrPass)

fun Application.registerUserRouting() {
    routing {
        userRouting()
    }
}