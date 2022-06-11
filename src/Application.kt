package de.odinmatthias

import chat.registerChatRouting
import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.profiles.ProfilePictureDAO
import de.odinmatthias.profiles.VaccinationDAO
import de.odinmatthias.profiles.registerProfileRouting
import de.odinmatthias.users.registerUserRouting
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
import io.ktor.websocket.*
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
import javax.imageio.ImageIO
import kotlin.collections.set


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
    registerChatRouting()
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

        webSocket("/myws/echo") {
            send(Frame.Text("Hi from server"))
            while (true) {
                val frame = incoming.receive()
                if (frame is Frame.Text) {
                    send(Frame.Text("Client said: " + frame.readText()))
                }
            }
        }

        createSampleData()
    }
}

fun createSampleData() {
    transaction {
        val freddo = UserDAO.new {
            name = "Freddo"
            email = "freddo@test.de"
            hashedPassword = BCrypt.hashpw("test", BCrypt.gensalt()).toByteArray()
        }

        val freddoBunny = ProfileDAO.new {
            name = "FreddoBunny"
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

        arrayOf(
            "resources/images/ankur-madan-Dv97xGwCidg-unsplash.jpg",
            "resources/images/li-yan-3m4it24gFSg-unsplash.jpg"
        ).forEachIndexed { i, path ->
            val image = ImageIO.read(File(path))
            val byteArrayOutStream = ByteArrayOutputStream()
            ImageIO.write(image, "jpg", byteArrayOutStream)
            val bytes = byteArrayOutStream.toByteArray()

            ProfilePictureDAO.new {
                profile = freddoBunny
                picture = ExposedBlob(bytes)
                index = i
            }
        }

        VaccinationDAO.new {
            profile = freddoBunny
            disease = "Myxomatosis"
            date = LocalDate.of(2021, 6, 18)
        }
        VaccinationDAO.new {
            profile = freddoBunny
            disease = "RVHD"
            date = LocalDate.of(2022, 6, 3)
        }
    }
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

data class UserSession(val loggedIn: Boolean = false, val userId: Int, val email: String = "")

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()

