package de.odinmatthias.routes

import de.odinmatthias.models.userStorage
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*


fun Route.userRouting() {
    route("/users") {
        get {
            if (userStorage.isNotEmpty()) {
                call.respond(userStorage)
            } else {
                call.respondText("No users found", status = HttpStatusCode.NotFound)
            }
        }
        get("{id}") {

        }
        post {

        }
        delete("{id}") {

        }
    }
}

fun Application.registerUserRouting() {
    routing {
        userRouting()
    }
}