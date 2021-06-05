package de.odinmatthias.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.thymeleaf.*
import users.User
import users.userStorage


fun Route.userRouting() {
    route("/signup") {
        get {
            call.respond(ThymeleafContent("signup", mapOf()))
        }
    }
    route("/users") {
        get {
            if (userStorage.isNotEmpty()) {
                call.respond(userStorage)
            } else {
                call.respondText("No users found", status = HttpStatusCode.NotFound)
            }
        }

        get("{id}") {
            val id = call.parameters["id"] ?: return@get call.respondText(
                "Missing or malformed id",
                status = HttpStatusCode.BadRequest
            )
            val user = userStorage.find { it.id == id } ?: return@get call.respondText(
                "No user with id $id",
                status = HttpStatusCode.NotFound
            )
            call.respond(user)
        }

        post {
            val formParameters = call.receiveParameters()
            val name = formParameters["name"] ?: return@post call.respondText("Missing or malformed name", status = HttpStatusCode.BadRequest)
            val email = formParameters["email"] ?: return@post call.respondText("Missing or malformed email", status = HttpStatusCode.BadRequest)
            val password =
                formParameters["password"] ?: return@post call.respondText("Missing or malformed password", status = HttpStatusCode.BadRequest)

            val user = User(id = userStorage.size.toString(), name = name, email = email, password = password)

            userStorage.add(user)
            call.respondText("User stored correctly", status = HttpStatusCode.Created)
        }

        delete("{id}") {
            val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest)
            if (userStorage.removeIf { it.id == id }) {
                call.respondText("User removed correctly", status = HttpStatusCode.Accepted)
            } else {
                call.respondText("Not Found", status = HttpStatusCode.NotFound)
            }
        }
    }
}

fun Application.registerUserRouting() {
    routing {
        userRouting()
    }
}