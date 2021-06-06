package de.odinmatthias

import io.ktor.http.*
import io.ktor.server.testing.*
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.matchesPattern
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.Before
import org.junit.Test
import org.mindrot.jbcrypt.BCrypt
import users.UserDAO
import users.Users
import kotlin.test.assertEquals

class UserRouteTests {
    @Before
    fun init() {
        DatabaseConnector()
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
            handleRequest(HttpMethod.Post, "/users") {
                addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                setBody(listOf("name" to "testName", "email" to "test@test.de", "password" to "testPassword").formUrlEncode())
            }.apply {
                assertThat(response.content, matchesPattern("User with id \\d+ stored correctly"))
                assertEquals(HttpStatusCode.Created, response.status())
            }
        }
    }

    @Test
    fun testDeleteUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val user = createUser()

            handleRequest(HttpMethod.Delete, "/users/${user.id}").apply {
                assertEquals("User with id ${user.id} removed correctly", response.content)
                assertEquals(HttpStatusCode.Accepted, response.status())
            }
        }
    }

    private fun createUser(): UserDAO {
        val user = transaction {
            return@transaction UserDAO.new {
                email = "${BCrypt.gensalt()}_test@test.de"
                name = "${BCrypt.gensalt()}_testName"
                hashedPassword = BCrypt.hashpw("testPassword", BCrypt.gensalt()).toByteArray()
            }
        }

        return user
    }
}