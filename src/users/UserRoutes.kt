package de.odinmatthias.users

import de.odinmatthias.PictureFormat
import de.odinmatthias.UserSession
import de.odinmatthias.imageBytesFromPath
import de.odinmatthias.matches.LikeOrPass
import de.odinmatthias.profiles.ProfileDAO
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.statements.api.ExposedBlob
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import users.UserDAO
import users.Users


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

                val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                    ?: return@get call.respond(HttpStatusCode.Unauthorized)

                val isMe = currentUser.id == id
                val user = transaction { return@transaction UserDAO.findById(id)?.toUser(isMe) }
                    ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(user)
            }

            get("/{id}/profiles") {
                val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                    "Missing or malformed id",
                    status = HttpStatusCode.BadRequest
                )

                val profiles = transaction { return@transaction UserDAO.findById(id)?.profiles?.map { it.toProfile() } }
                    ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(profiles)
            }

            authenticate("userAuth") {
                get("me") {
                    val user = call.sessions.get<UserSession>()?.getCurrentUser()
                        ?: return@get call.respond(HttpStatusCode.Unauthorized)

                    call.respond(user)
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

                val existingUser = transaction { return@transaction UserDAO.find { Users.email eq signupData.email }.firstOrNull() }
                if (existingUser != null) {
                    return@post call.respond(HttpStatusCode.Conflict)
                }

                val newUser = transaction {
                    val userDAO = UserDAO.new {
                        this.name = signupData.name
                        this.email = signupData.email
                        this.description = ""
                        this.picture = ExposedBlob(imageBytesFromPath("resources/images/default_user.png"))
                        this.pictureFormat = PictureFormat.JPG
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