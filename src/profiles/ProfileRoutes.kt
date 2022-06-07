package de.odinmatthias.profiles

import de.odinmatthias.UserSession
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.transactions.transaction
import users.UserDAO
import users.Users


fun Route.profileRouting() {
    route("api/v1") {
        authenticate("userAuth") {
            route("profiles") {
                get("{id}") {
                    val session = call.sessions.get<UserSession>()!!
                    val id = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                        "Missing or malformed id",
                        status = HttpStatusCode.BadRequest
                    )

                    val profileBelongsToUser = transaction {
                        val profiles = UserDAO.find { Users.email eq session.email }.first().profiles
                        return@transaction profiles.map { it.id.value }.contains(id)
                    }
                    if (!profileBelongsToUser) {
                        return@get call.respond(HttpStatusCode.BadRequest)
                    }

                    val profile = transaction {
                        return@transaction ProfileDAO.findById(id)?.toProfile()
                    } ?: return@get call.respond(HttpStatusCode.NotFound)

                    call.respond(profile)
                }

                post {
                    val profileCreationData = call.receive<ProfileCreationData>()

                    val session = call.sessions.get<UserSession>()!!
                    val profile = transaction {
                        val userDAO = UserDAO.find { Users.email eq session.email }.first()

                        return@transaction createProfile(userDAO, profileCreationData)
                    }

                    call.respond(profile)
                }
            }
        }
    }
}

data class ProfileCreationData(val name: String, val city: String, val race: String, val furColor: String, val age: Int, val weightInKg: Double, val description: String)

fun Application.registerProfileRouting() {
    routing {
        profileRouting()
    }
}