package de.odinmatthias

import io.ktor.http.*
import io.ktor.server.testing.*
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.After
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Test
import org.mindrot.jbcrypt.BCrypt
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
            handleRequest(HttpMethod.Get, "/users/1").apply {
                assertEquals("No user with id 1", response.content)
                assertEquals(HttpStatusCode.NotFound, response.status())
            }
        }
    }

    @Test
    fun testGetUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val user = createUser()
            handleRequest(HttpMethod.Get, "/users/${user.id}").apply {
                val expected = """{"id":${user.id},"name":"${user.name}","email":"${user.email}"}"""
                assertEquals(expected, response.content)
                assertEquals(HttpStatusCode.OK, response.status())
            }
        }
    }

    @Test
    fun testGetEmptyUsers() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            handleRequest(HttpMethod.Get, "/users").apply {
                assertEquals("No users found", response.content)
                assertEquals(HttpStatusCode.NotFound, response.status())
            }
        }
    }

    @Test
    fun testCreateUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val testEmail = "test@test.de"
            handleRequest(HttpMethod.Post, "/users") {
                addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                setBody(listOf("name" to "testName", "email" to testEmail, "password" to "testPassword").formUrlEncode())
            }.apply {
                val user = transaction { return@transaction UserDAO.find { Users.email eq testEmail }.firstOrNull() }
                assertNotNull(user)
            }
        }
    }

    @Test
    fun testDeleteUser() {
        val password = "testPassword"
        val user = createUser(password)

        withTestApplication(moduleFunction = { module(testing = true) }) {
            cookiesSession(listOf()) {
                handleRequest(HttpMethod.Post, "/login") {
                    addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                    setBody(listOf("email" to user.email, "password" to password).formUrlEncode())
                }.apply {
                    assertEquals(302, response.status()?.value)
                    assertEquals("/profile", response.headers["Location"])
                }

                handleRequest(HttpMethod.Delete, "/users/${user.id}") {
                    addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                }.apply {
                    assertEquals("User with id ${user.id} removed correctly", response.content)
                    assertEquals(HttpStatusCode.Accepted, response.status())
                }
            }
        }
    }
}

private fun createUser(password: String = "testPassword"): UserDAO {
    return transaction {
        return@transaction UserDAO.new {
            email = "${BCrypt.gensalt()}_test@test.de"
            name = "${BCrypt.gensalt()}_testName"
            hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt()).toByteArray()
        }
    }
}

private fun createUserAndSignIn() {
    val password = "testPassword"
    val user = createUser(password)


}
