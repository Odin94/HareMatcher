package de.odinmatthias.profiles

import com.google.gson.Gson
import de.odinmatthias.PictureFormat
import de.odinmatthias.PictureUtils
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
import java.io.ByteArrayOutputStream

private val logger = LoggerFactory.getLogger("ProfileRouting")

fun Route.profileRouting() {
    route("api/v1") {
        authenticate("userAuth") {
            route("profiles") {
                get("{id}") {
                    val profileId = call.parameters["id"]?.toInt() ?: return@get call.respondText(
                        "Missing or malformed id",
                        status = HttpStatusCode.BadRequest
                    )

                    val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                        ?: return@get call.respond(HttpStatusCode.Unauthorized)

                    val matchable = !currentUser.profileIds.contains(profileId)
                    val profile = transaction {
                        return@transaction ProfileDAO.findById(profileId)?.toProfile(matchable)
                    } ?: return@get call.respond(HttpStatusCode.NotFound)

                    call.respond(profile)
                }

                post {
                    val multiPartData = call.receiveMultipart()
                    val profileCreationData = multiPartDataToClass(multiPartData, ProfileCreationData::class.java)

                    val currentUserDao = call.sessions.get<UserSession>()?.getCurrentUserDAO()
                        ?: return@post call.respond(HttpStatusCode.Unauthorized)
                    val profile = transaction { createProfile(currentUserDao, profileCreationData) }

                    call.respond(profile)
                }

//                TODO: Do we need this for put requests / CORS stuff?
                options("{id}") {
                    call.respond(HttpStatusCode.OK)
                }

                put("{id}") {
                    val profileId = call.parameters["id"]?.toInt() ?: return@put call.respondText(
                        "Missing or malformed id",
                        status = HttpStatusCode.BadRequest
                    )

                    val currentUser = call.sessions.get<UserSession>()?.getCurrentUser()
                        ?: return@put call.respond(HttpStatusCode.Unauthorized)
                    if (!currentUser.profileIds.contains(profileId)) return@put call.respond(HttpStatusCode.Unauthorized)

                    val multiPartData = call.receiveMultipart()
                    val profileUpdateData = multiPartDataToClass(multiPartData, ProfileCreationData::class.java)

                    val existingProfile = transaction {
                        return@transaction ProfileDAO.findById(profileId)?.toProfile()
                    } ?: return@put call.respond(HttpStatusCode.NotFound)

                    val profile = transaction { updateProfile(existingProfile, profileUpdateData) }

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
    val picturesWithFormats: Array<PictureWithFormat>,
    val vaccinations: Array<VaccinationDTO>
)

data class PictureWithFormat(val bytes: ByteArray, val format: PictureFormat)


data class VaccinationDTO(val disease: String, val date: String)

suspend fun <T> multiPartDataToClass(data: MultiPartData, javaClass: Class<T>): T {
    val mapData = mutableMapOf<String, Any>()
    val images = mutableMapOf<String, ByteArrayOutputStream>()

//    TODO: This hangs forever on images
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
    mapData["picturesWithFormats"] = images.toSortedMap().map { (_, byteStream) ->
        val bytes = byteStream.toByteArray()
        val format = PictureUtils.guessFormat(bytes).name

        mapOf(
            "bytes" to bytes,
            "format" to format
        )
    }

    val gson = Gson()
    val jsonData = gson.toJson(mapData)
        .replace("\\", "")  // ugly hack to allow JSON.stringify'd lists :(
        .replace("\"[", "[")
        .replace("]\"", "]")
    return gson.fromJson(jsonData, javaClass)
}

fun Application.registerProfileRouting() {
    routing {
        profileRouting()
    }
}