package de.odinmatthias

import de.odinmatthias.matches.LikeOrPass
import de.odinmatthias.matches.SwipeDAO
import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.users.getRandomCity
import de.odinmatthias.users.getRandomFurColor
import de.odinmatthias.users.getRandomRace
import io.ktor.http.*
import io.ktor.server.testing.*
import org.jetbrains.exposed.sql.statements.api.ExposedBlob
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.Assert
import org.mindrot.jbcrypt.BCrypt
import users.UserDAO
import java.time.LocalDateTime


fun createAndSignInUser(engine: CookieTrackerTestApplicationEngine, password: String = "testPassword"): UserDAO {
    val user = createUser(password)
    signInUser(user, engine, password)

    return user
}

fun signInUser(user: UserDAO, engine: CookieTrackerTestApplicationEngine, password: String = "testPassword") {
    engine.handleRequest(HttpMethod.Post, "/api/v1/login") {
        addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
        setBody(listOf("email" to user.email, "password" to password).formUrlEncode())
    }.apply {
        Assert.assertEquals(HttpStatusCode.OK, response.status())
    }
}

fun createUser(password: String = "testPassword"): UserDAO {
    return transaction {
        return@transaction UserDAO.new {
            email = "${BCrypt.gensalt()}_test@test.de"
            name = "${BCrypt.gensalt()}_testName"
            description = "Yet another unique user"
            picture = ExposedBlob(imageBytesFromPath("resources/images/default_user.png"))
            pictureFormat = PictureFormat.JPG
            hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt()).toByteArray()
        }
    }
}

fun createProfile(owner: UserDAO): ProfileDAO {
    return transaction {
        return@transaction ProfileDAO.new {
            name = "Profile_${BCrypt.gensalt()}"
            user = owner
            city = getRandomCity()
            race = getRandomRace()
            furColor = getRandomFurColor()
            age = 2
            weightInKG = 8.0
            description = "Yet another beautiful bunny"
        }
    }
}

fun createSwipe(swiper: UserDAO, swipee: ProfileDAO, _createdOn: LocalDateTime, _likeOrPass: LikeOrPass = LikeOrPass.LIKE): SwipeDAO {
    return transaction {
        return@transaction SwipeDAO.new {
            user = swiper
            swipedProfile = swipee
            createdOn = _createdOn
            likeOrPass = _likeOrPass
        }
    }
}