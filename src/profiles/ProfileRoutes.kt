package de.odinmatthias.profiles

import com.google.gson.Gson
import de.odinmatthias.UserSession
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import users.UserDAO
import users.Users
import java.io.ByteArrayOutputStream

private val logger = LoggerFactory.getLogger("ProfileRouting")

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
                    val multiPartData = call.receiveMultipart()
                    val profileCreationData = multiPartDataToClass(multiPartData, ProfileCreationData::class.java)

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

data class ProfileCreationData(
    val name: String,
    val city: String,
    val race: String,
    val furColor: String,
    val age: Int,
    val weightInKg: Double,
    val description: String,
    val images: Array<ByteArray>
)

suspend fun <T> multiPartDataToClass(data: MultiPartData, javaClass: Class<T>): T {
    val mapData = mutableMapOf<String, Any>()
    val images = mutableMapOf<String, ByteArrayOutputStream>()

    data.forEachPart { part ->
        when (part) {
            is PartData.FormItem -> {
                mapData[part.name!!] = part.value
            }
            is PartData.FileItem -> {
                val imageName = part.originalFileName as String
                if (!images.contains(imageName)) {
                    images[imageName] = ByteArrayOutputStream()
                }

                part.streamProvider().copyTo(images[imageName]!!)
            }
            is PartData.BinaryItem -> {
                logger.info("unexpected data with name: ${part.name}")
            }
        }
    }

    mapData["images"] = images.toSortedMap().map { (_, byteStream) -> byteStream.toByteArray() }

    val gson = Gson()
    val jsonData = gson.toJson(mapData)
    return gson.fromJson(jsonData, javaClass)
}

fun Application.registerProfileRouting() {
    routing {
        profileRouting()
    }
}