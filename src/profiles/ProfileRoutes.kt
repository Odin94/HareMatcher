package de.odinmatthias.profiles

import de.odinmatthias.UserSession
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.transactions.transaction
import users.UserDAO
import users.Users


fun Route.profileRouting() {
    route("api/v1") {
        authenticate("userAuth") {
            route("profile") {
                get("{id}") {
                    val session = call.sessions.get<UserSession>()!!
                    val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                        "Missing or malformed id",
                        status = HttpStatusCode.BadRequest
                    )

                    val user = UserDAO.find { Users.email eq session.email }.first()

                    if (!user.profiles.map { it.id.value }.contains(id)) {
                        return@get call.respond(HttpStatusCode.BadRequest)
                    }

                    val profileDao = transaction { return@transaction ProfileDAO.findById(id) }
                        ?: return@get call.respond(HttpStatusCode.NotFound)

                    call.respond(profileDao.toProfile())
                }
            }
        }
    }
}

fun Application.registerProfileRouting() {
    routing {
        profileRouting()
    }
}