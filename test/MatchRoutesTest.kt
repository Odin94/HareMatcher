package de.odinmatthias

import com.google.gson.Gson
import de.odinmatthias.matches.LikeOrPass
import de.odinmatthias.matches.Swipe
import de.odinmatthias.matches.Swipes
import de.odinmatthias.profiles.ProfileDAO
import de.odinmatthias.profiles.Profiles
import io.ktor.http.*
import io.ktor.server.testing.*
import matches.Match
import matches.MatchesByProfile
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.*
import users.UserDAO
import users.Users
import java.time.LocalDateTime


class MatchRoutesTest {
    companion object {
        private lateinit var user_fred: UserDAO
        private lateinit var user_lana: UserDAO
        private lateinit var user_krane: UserDAO

        private lateinit var profile_fred_buns: ProfileDAO
        private lateinit var profile_fred_hunny: ProfileDAO
        private lateinit var profile_lana_snoops: ProfileDAO
        private lateinit var profile_lana_bugs: ProfileDAO

        @BeforeClass
        @JvmStatic
        fun initClass() {
            DatabaseConnector()
            user_fred = createUser()
            profile_fred_buns = createProfile(user_fred)
            profile_fred_hunny = createProfile(user_fred)

            user_lana = createUser()
            profile_lana_snoops = createProfile(user_lana)
            profile_lana_bugs = createProfile(user_lana)

            user_krane = createUser()
        }

        @AfterClass
        @JvmStatic
        fun cleanupClass() {
            transaction {
                Users.deleteAll()
                Profiles.deleteAll()
            }
        }
    }

    @Before
    fun init() {
        transaction {
            Swipes.deleteAll()
        }
    }

    @After
    fun cleanup() {
        transaction {
            Swipes.deleteAll()
        }
    }

    @Test
    fun testGetOneMatch() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val matchTime = LocalDateTime.now()
            createSwipe(user_lana, profile_fred_buns, matchTime)
            createSwipe(user_lana, profile_fred_hunny, matchTime, LikeOrPass.PASS)

            cookiesSession(listOf()) {
                signInUser(user_fred, this)
                handleRequest(HttpMethod.Get, "/api/v1/matches").apply {
                    val expected = transaction {
                        val lana = user_lana.toUser()
                        val expectedMatch = Match(
                            lana.id!!, profile_fred_buns.id.value, lana.name, lana.picture, matchTime.format(
                                Swipe.swipeDateTimeFormatter
                            )
                        )

                        return@transaction Gson().toJson(
                            listOf(
                                MatchesByProfile(profile_fred_buns.toProfile(), listOf(expectedMatch)),
                                MatchesByProfile(profile_fred_hunny.toProfile(), listOf())
                            )
                        )
                    }

                    Assert.assertEquals(HttpStatusCode.OK, response.status())
                    Assert.assertEquals(expected, response.content)
                }
            }
        }
    }

    @Test
    fun testGetMultipleMatches() {
        withTestApplication(moduleFunction = { module(testing = true) }) {
            val matchTime = LocalDateTime.now()
            createSwipe(user_lana, profile_fred_buns, matchTime)
            createSwipe(user_lana, profile_fred_hunny, matchTime)
            createSwipe(user_krane, profile_fred_hunny, matchTime)


            cookiesSession(listOf()) {
                signInUser(user_fred, this)
                handleRequest(HttpMethod.Get, "/api/v1/matches").apply {
                    val expected = transaction {
                        val lana = user_lana.toUser()
                        val krane = user_krane.toUser()

                        val expectedMatchBuns = Match(
                            lana.id!!, profile_fred_buns.id.value, lana.name, lana.picture, matchTime.format(
                                Swipe.swipeDateTimeFormatter
                            )
                        )
                        val expectedMatchHunny = Match(
                            lana.id!!, profile_fred_hunny.id.value, lana.name, lana.picture, matchTime.format(
                                Swipe.swipeDateTimeFormatter
                            )
                        )
                        val expectedMatchHunny2 = Match(
                            krane.id!!, profile_fred_hunny.id.value, krane.name, krane.picture, matchTime.format(
                                Swipe.swipeDateTimeFormatter
                            )
                        )

                        return@transaction Gson().toJson(
                            listOf(
                                MatchesByProfile(profile_fred_buns.toProfile(), listOf(expectedMatchBuns)),
                                MatchesByProfile(profile_fred_hunny.toProfile(), listOf(expectedMatchHunny, expectedMatchHunny2))
                            )
                        )
                    }

                    Assert.assertEquals(HttpStatusCode.OK, response.status())
                    Assert.assertEquals(expected, response.content)
                }
            }
        }
    }
}