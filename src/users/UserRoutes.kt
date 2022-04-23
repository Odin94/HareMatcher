package de.odinmatthias.users

import de.odinmatthias.UserSession
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import users.User
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
                call.sessions.clear<UserIdPrincipal>()
                call.sessions.clear<UserSession>()
                call.respondRedirect("/login")
            }

            route("profile") {
                get {
                    val session = call.sessions.get<UserSession>()!!
                    val user = transaction { return@transaction UserDAO.find { Users.email eq session.email }.first() }

                    call.respond(User(user.id.value, user.name, user.email))
                }
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

        route("/users") {
            get {
                val foundUsers: ArrayList<User> = arrayListOf()
                transaction {
                    Users.selectAll().map {
                        val foundUser = User(id = it[Users.id].value, name = it[Users.name], email = it[Users.email])
                        foundUsers.add(foundUser)
                    }
                }
                call.respond(foundUsers)
            }

            get("{id}") {
                val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                    "Missing or malformed id",
                    status = HttpStatusCode.BadRequest
                )

                val user = transaction { return@transaction UserDAO.findById(id) }
                    ?: return@get call.respond(HttpStatusCode.NotFound)

                call.respond(User(user.id.value, user.name, user.email))
            }

            post {
                val signupData = call.receive<SignupData>()

                val newUser = transaction {
                    return@transaction UserDAO.new {
                        this.name = signupData.name
                        this.email = signupData.email
                        this.hashedPassword = BCrypt.hashpw(signupData.password, BCrypt.gensalt()).toByteArray()
                    }
                }

                call.respond(User(newUser.id.value, newUser.name, newUser.email))
            }
        }
    }
}

data class SignupData(val email: String, val password: String, val name: String)

fun Application.registerUserRouting() {
    routing {
        userRouting()
    }
}