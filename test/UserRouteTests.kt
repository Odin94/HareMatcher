package de.odinmatthias

import com.google.gson.Gson
import io.ktor.http.*
import io.ktor.server.testing.*
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.After
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Test
import org.mindrot.jbcrypt.BCrypt
import users.User
import users.UserDAO
import users.Users
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class UserRouteTests {
    companion object {
        @BeforeClass
        @JvmStatic
        fun initClass() {
            DatabaseConnector()
        }
    }

    @Before
    fun init() {
        transaction {
            Users.deleteAll()
        }
    }

    @After
    fun cleanup() {
        transaction {
            Users.deleteAll()
        }
    }

    @Test
    fun testGetNonExistentUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            handleRequest(HttpMethod.Get, "/api/v1/users/1").apply {
                assertEquals(HttpStatusCode.NotFound, response.status())
            }
        }
    }

    @Test
    fun testGetUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val user = createUser("")
            handleRequest(HttpMethod.Get, "/api/v1/users/${user.id}").apply {
                val expected = Gson().toJson(user.toUser())
                assertEquals(expected, response.content)
                assertEquals(HttpStatusCode.OK, response.status())
            }
        }
    }

    @Test
    fun testGetUsers() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            handleRequest(HttpMethod.Get, "/api/v1/users").apply {
                val foundUsers: ArrayList<User> = arrayListOf()
                transaction {
                    Users.selectAll().forEach {
                        foundUsers.add(UserDAO.wrapRow(it).toUser())
                    }
                }

                val expected = Gson().toJson(foundUsers)
                assertEquals(expected, response.content)
                assertEquals(HttpStatusCode.OK, response.status())
            }
        }
    }

    @Test
    fun testCreateUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val testEmail = "test@test.de"
            handleRequest(HttpMethod.Post, "/api/v1/users") {
                addHeader(HttpHeaders.ContentType, ContentType.Application.Json.toString())
                setBody(Gson().toJson(mapOf("name" to "testName", "email" to testEmail, "password" to "testPassword")))
            }.apply {
                val user = transaction { return@transaction UserDAO.find { Users.email eq testEmail }.firstOrNull() }
                assertNotNull(user)
            }
        }
    }

    @Test
    fun testDeleteUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            cookiesSession(listOf()) {
                val user = createAndSignInUser(this)

                handleRequest(HttpMethod.Delete, "/api/v1/users/${user.id}") {
                    addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                }.apply {
                    assertEquals("User with id ${user.id} removed correctly", response.content)
                    assertEquals(HttpStatusCode.Accepted, response.status())
                }
            }
        }
    }
}

private fun createAndSignInUser(engine: CookieTrackerTestApplicationEngine): UserDAO {
    val password = "testPassword"
    val user = createUser(password)

    engine.handleRequest(HttpMethod.Post, "/api/v1/login") {
        addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
        setBody(listOf("email" to user.email, "password" to password).formUrlEncode())
    }.apply {
        assertEquals(HttpStatusCode.OK, response.status())
    }

    return user
}

private fun createUser(password: String): UserDAO {
    return transaction {
        return@transaction UserDAO.new {
            email = "${BCrypt.gensalt()}_test@test.de"
            name = "${BCrypt.gensalt()}_testName"
            hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt()).toByteArray()
        }
    }
}