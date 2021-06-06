package de.odinmatthias.users

import de.odinmatthias.UserSession
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import io.ktor.thymeleaf.*
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import users.User
import users.UserDAO
import users.Users


fun Route.userRouting() {
    route("/signup") {
        get {
            call.respond(ThymeleafContent("signup", mapOf()))
        }
    }

    route("/login") {
        get {
            val error = call.request.queryParameters["error"] ?: ""

            call.respond(ThymeleafContent("login", mapOf("error" to error)))
        }

        authenticate("userAuth") {
            post {
                call.respondText("Session: ${call.sessions.get<UserSession>()}")
            }
        }
    }

    authenticate("userAuth") {
        post("/logout") {
            call.sessions.clear<UserIdPrincipal>()
            call.sessions.clear<UserSession>()
            call.respondRedirect("/login")
        }
    }

    route("/profile") {
        authenticate("userAuth") {
            get {
                val session = call.sessions.get<UserSession>()!!

                call.respond(ThymeleafContent("profile", mapOf("email" to session.email)))
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
            if (foundUsers.isNotEmpty()) {
                call.respond(foundUsers)
            } else {
                call.respondText("No users found", status = HttpStatusCode.NotFound)
            }
        }

        get("{id}") {
            val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                "Missing or malformed id",
                status = HttpStatusCode.BadRequest
            )

            val user = transaction { return@transaction UserDAO.findById(id) }
                ?: return@get call.respondText(
                    "No user with id $id",
                    status = HttpStatusCode.NotFound
                )

            call.respond(User(user.id.value, user.name, user.email))
        }

        post {
            val formParameters = call.receiveParameters()
            val name = formParameters["name"] ?: return@post call.respondText("Missing or malformed name", status = HttpStatusCode.BadRequest)
            val email = formParameters["email"] ?: return@post call.respondText("Missing or malformed email", status = HttpStatusCode.BadRequest)
            val password =
                formParameters["password"] ?: return@post call.respondText("Missing or malformed password", status = HttpStatusCode.BadRequest)

            val newUser = transaction {
                return@transaction UserDAO.new {
                    this.name = name
                    this.email = email
                    this.hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt()).toByteArray()
                }
            }
            call.respondText("User with id ${newUser.id} stored correctly", status = HttpStatusCode.Created)
        }

        authenticate("userAuth") {
            delete("{id}") {
                val session = call.sessions.get<UserSession>()!!

                val id = call.parameters["id"]?.toInt() ?: return@delete call.respond(HttpStatusCode.BadRequest)

                if (UserDAO.findById(id)?.email != session.email) {
                    return@delete call.respond(HttpStatusCode.BadRequest)
                }

                val deletedItemsCount = transaction { return@transaction Users.deleteWhere { Users.id eq id } }

                if (deletedItemsCount == 1) {
                    call.respondText("User with id $id removed correctly", status = HttpStatusCode.Accepted)
                } else {
                    call.respondText("Not Found", status = HttpStatusCode.NotFound)
                }
            }
        }
    }
}

fun Application.registerUserRouting() {
    routing {
        userRouting()
    }
}