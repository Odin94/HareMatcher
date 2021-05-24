package de.odinmatthias

import com.google.gson.Gson
import de.odinmatthias.models.User
import io.ktor.http.*
import io.ktor.server.testing.*
import org.junit.Test
import kotlin.test.assertEquals

class UserRouteTests {
    var gson = Gson()

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
    fun testCreateUser() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            handleRequest(HttpMethod.Post, "/users") {
                val user = User("1", "test user", "test@user.com")

                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(gson.toJson(user))
            }.apply {
                assertEquals("User stored correctly", response.content)
                assertEquals(HttpStatusCode.Created, response.status())
            }
        }
    }
}