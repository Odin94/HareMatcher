package de.odinmatthias

import de.odinmatthias.PictureUtils.saveImageBytesToFile
import de.odinmatthias.matches.*
import de.odinmatthias.profiles.*
import de.odinmatthias.users.*
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.http.*
import io.ktor.http.cio.websocket.*
import io.ktor.http.content.*
import io.ktor.locations.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import io.ktor.thymeleaf.*
import io.ktor.util.*
import matches.registerMatchRouting
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.statements.api.ExposedBlob
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.LoggerFactory
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver
import users.UserDAO
import users.Users
import java.io.ByteArrayOutputStream
import java.io.File
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import javax.imageio.ImageIO
import kotlin.collections.set
import kotlin.random.Random


fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
private val logger = LoggerFactory.getLogger("Application")

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(Thymeleaf) {
        setTemplateResolver(ClassLoaderTemplateResolver().apply {
            prefix = "react/"
            suffix = ".html"
            characterEncoding = "utf-8"
        })
    }

    install(CORS) {
        host("localhost:3000") // TODO: disable for production usage
        allowCredentials = true
        allowNonSimpleContentTypes = true
    }

    install(Authentication) {
        form("userAuth") {
            skipWhen { call ->
                val userSession = call.sessions.get<UserSession>()
                userSession != null && userSession.loggedIn
            }
            challenge {
                val errors: List<AuthenticationFailedCause> = call.authentication.allErrors

                when (errors.singleOrNull()) {
                    AuthenticationFailedCause.InvalidCredentials ->
                        call.respondText(
                            text = "invalid credentials",
                            status = HttpStatusCode.Unauthorized
                        )

                    AuthenticationFailedCause.NoCredentials ->
                        call.respondText(
                            text = "no credentials",
                            status = HttpStatusCode.Unauthorized
                        )

                    else ->
                        call.respondText(
                            text = "unknown error",
                            status = HttpStatusCode.Unauthorized
                        )
                }
            }

            userParamName = "email"
            passwordParamName = "password"
            validate {
                val email = it.name
                val user = transaction {
                    return@transaction UserDAO.find { Users.email eq email }.firstOrNull()
                } ?: return@validate null

                val passwordIsCorrect = BCrypt.checkpw(it.password, String(user.hashedPassword))
                if (passwordIsCorrect) {
                    val principal = UserIdPrincipal(it.name)
                    val session = sessions.get<UserSession>() ?: UserSession(true, user.id.value, principal.name)
                    sessions.set(session.copy(loggedIn = true, userId = user.id.value, email = principal.name))

                    principal
                } else {
                    null
                }
            }
        }
    }

    install(ContentNegotiation) {
        gson { }
    }

    install(Locations) {
    }

    install(Sessions) {
        cookie<UserSession>("UserSession", directorySessionStorage(File(".sessions"), cached = false)) {
            cookie.extensions["SameSite"] = "lax"
            val secretSignKeyRaw = this::class.java.classLoader.getResource("secretSignKey")?.readText() ?: "003502b3040a060108094a0b0d0dfe1f"
            val secretSignKey = hex(secretSignKeyRaw)
            transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
        }
    }

    install(Compression) {
        gzip {
            priority = 1.0
        }
        deflate {
            priority = 10.0
            minimumSize(1024) // condition
        }
    }

    install(DefaultHeaders) {
        header("X-Engine", "Ktor") // will send this header with each response
    }

    install(io.ktor.websocket.WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    DatabaseConnector()

    install(StatusPages) {
        status(HttpStatusCode.NotFound) {
            // render index.html on 404 and handle issues in react router
            call.respond(HttpStatusCode.NotFound, ThymeleafContent("index", mapOf()))
        }
    }

    registerUserRouting()
    registerProfileRouting()
    registerMatchRouting()
    routing {
        static("/") {
            default("resources/react/index.html")
            resources("react")
        }

        // Static feature. Try to access `/static/ktor_logo.svg`
        static("/static") {
            resources("static")
            resources("react/static")
            resources("css")  // access with /static/test.css
            resources("js")
        }

        authenticate("userAuth") {
            get("/protected/route/basic") {
                val principal = call.principal<UserIdPrincipal>()!!
                call.respondText("Hello ${principal.name}")
            }
        }

        get("/json/gson") {
            call.respond(mapOf("hello" to "world"))
        }

        get<MyLocation> {
            call.respondText("Location: name=${it.name}, arg1=${it.arg1}, arg2=${it.arg2}")
        }
        // Register nested routes
        get<Type.Edit> {
            call.respondText("Inside $it")
        }
        get<Type.List> {
            call.respondText("Inside $it")
        }

        deleteAllData()  // TODO: Remove for production usage
        createSampleData()
    }
}

fun deleteAllData() {
    transaction {
        Swipes.deleteAll()
        Vaccinations.deleteAll()
        ProfilePictures.deleteAll()
        ChatMessages.deleteAll()
        Profiles.deleteAll()
        Users.deleteAll()
    }
}

fun createSampleData() {

    // generate 50 randomized users
    val randomUsers = transaction {
        val users = (1..50).map {
            val userName = getRandomName()
            val picturePath = "resources/images/testUserPictures/${it}.jpg"
            if (!File(picturePath).exists()) {
                Thread.sleep(500)  // to avoid getting the same picture on the next run
                saveImageBytesToFile(getRandomUserPicture(), picturePath)
            }
            val pictureBytes = imageBytesFromPath(picturePath)

            val user = UserDAO.new {
                name = userName
                email = "$userName-${Random.nextInt(0, 99999)}@test.de"
                description = """
                    ${getRandomUserAttribute().replaceFirstChar(Char::titlecase)}, ${getRandomUserAttribute()}, ${getRandomUserAttribute()}.
                    
                    ${getRandomHobbyIntro()} ${getRandomHobby()}, ${getRandomHobby()}, and ${getRandomHobby()}.
                    """.trimIndent()
                picture = ExposedBlob(pictureBytes)
                pictureFormat = PictureFormat.JPG
                hashedPassword = BCrypt.hashpw("test", BCrypt.gensalt()).toByteArray()
            }

            return@map user
        }
        return@transaction users
    }

    transaction {
        val freddoPictureBytes = imageBytesFromPath("resources/images/christopher-campbell-rDEOVtE7vOs-unsplash.jpg")
        val freddo = UserDAO.new {
            name = "Freddo"
            email = "freddo@test.de"
            description = """
                Bunny lover, parent, book club organizer.
                
                I love reading books, especially about how to care for bunnies or fiction about bunnies that can talk but they shouldn't wear human clothing cause that's weird they have fur why would they need clothes lol
            """.trimIndent()
            picture = ExposedBlob(freddoPictureBytes)
            pictureFormat = PictureFormat.JPG
            hashedPassword = BCrypt.hashpw("test", BCrypt.gensalt()).toByteArray()
        }

        val profilePictures = arrayOf(
            "resources/images/ankur-madan-Dv97xGwCidg-unsplash.jpg",
            "resources/images/li-yan-3m4it24gFSg-unsplash.jpg"
        ).map { imageBytesFromPath(it) }
        val freddoBunnies = (1..20).map {
            val bunnyProfile = ProfileDAO.new {
                name = "FreddoBunny$it"
                user = freddo
                city = "Frankfurt"
                race = "Flemish Giant"
                furColor = "Black"
                age = 2
                weightInKG = 8.0
                description = """
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget pharetra augue. Fusce lectus lorem, suscipit vitae consequat blandit, dignissim ac metus. Fusce sodales, orci quis varius sollicitudin, orci metus aliquet urna, sit amet varius nunc nibh non augue. Donec porta consequat urna malesuada iaculis. Nulla sit amet sem congue felis sagittis imperdiet nec et dui. In cursus, dolor venenatis bibendum hendrerit, turpis ante porta massa, et tempus nisl quam in nibh

                Proin convallis dui ut pharetra venenatis. Vivamus id faucibus sem. Nunc blandit pellentesque facilisis. Etiam egestas et mauris eget convallis. Aliquam laoreet egestas neque, eget ornare odio faucibus et. Donec placerat eros neque, sit amet egestas mi auctor a. Nulla gravida velit enim, vitae sodales odio egestas
            """
            }

            profilePictures.forEachIndexed { i, imageBytes ->
                ProfilePictureDAO.new {
                    profile = bunnyProfile
                    picture = ExposedBlob(imageBytes)
                    format = PictureFormat.JPG
                    index = i
                }
            }

            VaccinationDAO.new {
                profile = bunnyProfile
                disease = "Myxomatosis"
                date = LocalDate.of(2021, 6, 18)
            }
            VaccinationDAO.new {
                profile = bunnyProfile
                disease = "RVHD"
                date = LocalDate.of(2022, 6, 3)
            }

            return@map bunnyProfile
        }
        logger.info("Bunny profile id: ${freddoBunnies[0].id}")


        // Frado
        val fradoPictureBytes = imageBytesFromPath("resources/images/christopher-campbell-XvPYzoPSheA-unsplash.jpg")
        val frado = UserDAO.new {
            name = "Frado"
            email = "frado@test.de"
            description = """
                Loving husband, train operator by day and painter by night, father to a cute little bunny
                
                My husband and I looking to find a friend for my bunny. His brother died recently :(  and I don't want him to get lonely
            """.trimIndent()
            picture = ExposedBlob(fradoPictureBytes)
            pictureFormat = PictureFormat.JPG
            hashedPassword = BCrypt.hashpw("test", BCrypt.gensalt()).toByteArray()
        }

        SwipeDAO.new {
            user = frado
            swipedProfile = freddoBunnies[0]
            createdOn = LocalDateTime.now()
            likeOrPass = LikeOrPass.LIKE
        }

        randomUsers.forEach {
            SwipeDAO.new {
                user = it
                swipedProfile = freddoBunnies[Random.nextInt(0, freddoBunnies.size - 1)]
                createdOn = LocalDateTime.now()
                likeOrPass = LikeOrPass.LIKE
            }
        }

        ChatMessageDAO.new {
            message = "Hey Frado, I see you like my first bunny! Can you tell me more about yours so I can check if it would be a good fit?"
            sourceUser = freddo
            targetUser = frado
            profileInQuestion = freddoBunnies[0]
            sentOn = LocalDateTime.now()
        }
    }
}

fun imageBytesFromPath(path: String): ByteArray {
    val picture = ImageIO.read(File(path))
    val byteArrayOutStream = ByteArrayOutputStream()

    val format = path.split(".").last()
    ImageIO.write(picture, format, byteArrayOutStream)

    return byteArrayOutStream.toByteArray()
}

@Location("/location/{name}")
class MyLocation(val name: String, val arg1: Int = 42, val arg2: String = "default")

@Location("/type/{name}")
data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}

data class UserSession(val loggedIn: Boolean = false, val userId: Int = -1, val email: String = "") {
    fun getCurrentUser() = transaction { return@transaction UserDAO.findById(userId)?.toUser(true) }
    fun getCurrentUserDAO() = transaction { return@transaction UserDAO.findById(userId) }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()

