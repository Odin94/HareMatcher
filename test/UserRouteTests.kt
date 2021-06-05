package de.odinmatthias

import io.ktor.http.*
import io.ktor.server.testing.*
import org.junit.Test
import kotlin.test.assertEquals

class UserRouteTests {
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
                addHeader(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
                setBody(listOf("name" to "testName", "email" to "test@test.de", "password" to "testPassword").formUrlEncode())
            }.apply {
                assertEquals("User stored correctly", response.content)
                assertEquals(HttpStatusCode.Created, response.status())
            }
        }
    }
}